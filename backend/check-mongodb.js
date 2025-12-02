/**
 * Check MongoDB connection and verify/create collections
 */

const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017/nebula';
const client = new MongoClient(uri);

async function checkMongoDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!\n');

    const db = client.db('nebula');
    
    // Get existing collections
    const collections = await db.listCollections().toArray();
    const existingCollections = collections.map(c => c.name);
    
    console.log('📊 Current Database: nebula');
    console.log('📁 Existing collections:', existingCollections.length > 0 ? existingCollections.join(', ') : 'none');
    console.log('');
    
    // Required collections
    const requiredCollections = ['users', 'tasks', 'files'];
    
    console.log('🔍 Checking required collections...\n');
    
    for (const collectionName of requiredCollections) {
      if (existingCollections.includes(collectionName)) {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`✅ ${collectionName.padEnd(10)} - EXISTS (${count} document${count !== 1 ? 's' : ''})`);
        
        // Show sample data
        if (count > 0) {
          const sample = await db.collection(collectionName).findOne();
          const keys = Object.keys(sample).slice(0, 5);
          console.log(`   Fields: ${keys.join(', ')}${Object.keys(sample).length > 5 ? '...' : ''}`);
        }
      } else {
        console.log(`❌ ${collectionName.padEnd(10)} - MISSING`);
        console.log(`   Creating collection: ${collectionName}...`);
        await db.createCollection(collectionName);
        console.log(`   ✅ Created successfully`);
      }
      console.log('');
    }
    
    // Summary
    console.log('=' .repeat(60));
    console.log('📋 Collection Summary:');
    for (const collectionName of requiredCollections) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`   ${collectionName}: ${count} documents`);
    }
    
    console.log('\n✅ MongoDB check complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.close();
    console.log('🔒 Connection closed.');
  }
}

// Run the check
console.log('🚀 Starting MongoDB connection check...\n');
checkMongoDB();
