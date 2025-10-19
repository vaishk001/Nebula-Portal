
# Using MongoDB with Nebula in Production

This document explains how to properly integrate MongoDB with the Nebula application in a production environment.

## Browser vs Server Considerations

The error you encountered (`util.promisify is not a function`) occurs because the MongoDB Node.js driver is designed to run on the server-side, not in a web browser. This is a fundamental architectural consideration:

1. **MongoDB connections should happen server-side only**, not in the browser
2. The browser cannot directly connect to MongoDB (security and technical limitations)
3. In production, you need an API layer between your frontend and MongoDB

## Setting Up a Proper Architecture

### Option 1: Backend API (Recommended for Production)

1. Create a server using Node.js/Express, Next.js API routes, or another server-side framework
2. Implement API endpoints for file operations (upload, list, delete)
3. Connect to MongoDB from your server code
4. Your React frontend makes HTTP requests to your API

Example structure:
```
/frontend        # React application
/backend         # Node.js server
  /routes        # API endpoints
  /models        # MongoDB models
  /controllers   # Business logic
  /config        # Configuration files
```

### Option 2: BaaS (Backend as a Service)

1. Use a service like Firebase, Supabase, or MongoDB Atlas App Services
2. Configure authentication and security rules
3. Use their JavaScript SDK to interact with the database from your frontend

## Client-Side Fallback (Current Implementation)

The current implementation in `mongodb.ts` provides a client-side fallback that:

1. Uses `localStorage` when running in a browser environment
2. Simulates MongoDB API for consistent code patterns
3. Shows a warning toast about using local storage instead

This approach works for development or demo purposes but is not suitable for production.

## Encrypting Files for MongoDB Storage

For proper file encryption and storage with MongoDB:

1. **Use server-side encryption** before storing in MongoDB
2. Or use client-side encryption but process through a secure API
3. Store only file metadata in MongoDB
4. Use a dedicated file storage service (AWS S3, Google Cloud Storage) for the actual files

## Getting Started with a Proper Setup

1. Create a simple Express server:
   ```javascript
   // server.js
   const express = require('express');
   const { MongoClient } = require('mongodb');
   const cors = require('cors');
   
   const app = express();
   app.use(cors());
   app.use(express.json());
   
   const uri = process.env.MONGODB_URI;
   const client = new MongoClient(uri);
   
   // Connect to MongoDB
   async function connectToMongoDB() {
     try {
       await client.connect();
       console.log('Connected to MongoDB');
     } catch (error) {
       console.error('Failed to connect to MongoDB', error);
     }
   }
   
   // API endpoints
   app.get('/api/files', async (req, res) => {
     try {
       const files = await client.db('nebula').collection('files').find({}).toArray();
       res.json(files);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   app.post('/api/files', async (req, res) => {
     try {
       const result = await client.db('nebula').collection('files').insertOne(req.body);
       res.status(201).json({ id: result.insertedId });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   // Start server
   const PORT = process.env.PORT || 5000;
   app.listen(PORT, async () => {
     await connectToMongoDB();
     console.log(`Server running on port ${PORT}`);
   });
   ```

2. Modify your React app to use the API:
   ```javascript
   // In your React component
   const uploadFile = async (fileInfo) => {
     const response = await fetch('http://localhost:5000/api/files', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(fileInfo)
     });
     return response.json();
   };
   ```

This approach separates concerns appropriately and follows best practices for web development.
