
// This is a browser-compatible MongoDB connection utility
// In a real production app, MongoDB connections should only happen on the server side

import { toast } from 'sonner';
import { Document } from 'mongodb';

// This interface mimics the MongoDB document structure for client-side code
export interface MongoDocument extends Document {
  _id?: string;
}

// Mock client for browser environment
const mockClient = {
  db: (dbName: string) => ({
    collection: (collectionName: string) => ({
      find: (query = {}) => ({ toArray: async () => [] }),
      findOne: async (query = {}) => null,
      insertOne: async (document: any) => ({ insertedId: `mock-${Date.now()}` }),
      updateOne: async (query: any, update: any) => ({ modifiedCount: 1 }),
      deleteOne: async (query: any) => ({ deletedCount: 1 })
    })
  }),
  connect: async () => {},
  close: async () => {}
};

// Signal if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Flag to track connection status
let connected = false;

/**
 * Connect to MongoDB database
 * In browser environments, this returns a mock client
 */
export async function connectToDatabase() {
  // In browser, return mock client and show warning
  if (isBrowser) {
    console.warn('MongoDB cannot be used directly in browser. Using localStorage fallback.');
    toast.warning('Using local storage for data persistence. In production, this would connect to MongoDB.');
    return {
      client: mockClient,
      db: mockClient.db('nebula')
    };
  }
  
  // This code will never run in the browser
  // It's here to maintain the API contract with server-side code
  if (!connected) {
    try {
      await mockClient.connect();
      connected = true;
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB", error);
      throw error;
    }
  }
  
  return {
    client: mockClient,
    db: mockClient.db('nebula')
  };
}

/**
 * Disconnect from MongoDB database
 * In browser environments, this is a no-op
 */
export async function disconnectFromDatabase() {
  if (isBrowser) {
    return;
  }
  
  if (connected) {
    try {
      await mockClient.close();
      connected = false;
      console.log("Disconnected from MongoDB");
    } catch (error) {
      console.error("Error while disconnecting from MongoDB", error);
    }
  }
}

/**
 * Helper function to convert MongoDB ObjectId to string
 */
export function objectIdToString(doc: Document): Document {
  if (doc?._id) {
    doc._id = doc._id.toString();
  }
  return doc;
}

/**
 * Expose collections for easy access
 * In browser environments, these will use localStorage
 */
export const collections = {
  users: (query = {}) => {
    if (isBrowser) {
      // Return localStorage-based implementation
      return createLocalStorageCollection('users');
    }
    return mockClient.db('nebula').collection('users');
  },
  tasks: (query = {}) => {
    if (isBrowser) {
      return createLocalStorageCollection('tasks');
    }
    return mockClient.db('nebula').collection('tasks');
  },
  queries: (query = {}) => {
    if (isBrowser) {
      return createLocalStorageCollection('queries');
    }
    return mockClient.db('nebula').collection('queries');
  },
  files: (query = {}) => {
    if (isBrowser) {
      return createLocalStorageCollection('files');
    }
    return mockClient.db('nebula').collection('files');
  }
};

/**
 * Create a localStorage-based collection that mimics MongoDB collection API
 */
function createLocalStorageCollection(collectionName: string) {
  return {
    find: (query = {}) => ({
      toArray: async () => {
        const items = JSON.parse(localStorage.getItem(`nebula${collectionName}`) || '[]');
        return filterItems(items, query);
      }
    }),
    findOne: async (query = {}) => {
      const items = JSON.parse(localStorage.getItem(`nebula${collectionName}`) || '[]');
      return filterItems(items, query)[0] || null;
    },
    insertOne: async (document: any) => {
      const items = JSON.parse(localStorage.getItem(`nebula${collectionName}`) || '[]');
      const newId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newDoc = { ...document, _id: newId };
      items.push(newDoc);
      localStorage.setItem(`nebula${collectionName}`, JSON.stringify(items));
      return { insertedId: newId };
    },
    updateOne: async (query: any, update: any) => {
      const items = JSON.parse(localStorage.getItem(`nebula${collectionName}`) || '[]');
      let modifiedCount = 0;
      const updatedItems = items.map((item: any) => {
        if (matchesQuery(item, query)) {
          modifiedCount++;
          return { ...item, ...update.$set };
        }
        return item;
      });
      localStorage.setItem(`nebula${collectionName}`, JSON.stringify(updatedItems));
      return { modifiedCount };
    },
    deleteOne: async (query: any) => {
      const items = JSON.parse(localStorage.getItem(`nebula${collectionName}`) || '[]');
      const index = items.findIndex((item: any) => matchesQuery(item, query));
      let deletedCount = 0;
      
      if (index !== -1) {
        items.splice(index, 1);
        deletedCount = 1;
        localStorage.setItem(`nebula${collectionName}`, JSON.stringify(items));
      }
      
      return { deletedCount };
    }
  };
}

/**
 * Helper function to filter items based on a MongoDB-like query
 */
function filterItems(items: any[], query: any): any[] {
  return items.filter(item => matchesQuery(item, query));
}

/**
 * Check if an item matches a MongoDB-like query
 */
function matchesQuery(item: any, query: any): boolean {
  for (const key in query) {
    if (key === '_id') {
      // Handle string comparison for IDs
      if (item[key]?.toString() !== query[key]?.toString()) {
        return false;
      }
    } else if (typeof query[key] === 'object' && query[key] !== null) {
      // Handle operators like $eq, $gt, etc.
      for (const op in query[key]) {
        if (op === '$eq' && item[key] !== query[key].$eq) return false;
        if (op === '$ne' && item[key] === query[key].$ne) return false;
        if (op === '$gt' && !(item[key] > query[key].$gt)) return false;
        if (op === '$lt' && !(item[key] < query[key].$lt)) return false;
      }
    } else if (item[key] !== query[key]) {
      return false;
    }
  }
  return true;
}
