// Test script to verify MongoDB connection and data operations
const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017/nebula';
const client = new MongoClient(uri);

async function testDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    const db = client.db('nebula');
    console.log(`📊 Database: ${db.databaseName}\n`);

    // List existing collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Existing collections:');
    collections.forEach(col => console.log(`   - ${col.name}`));
    console.log('');

    // Create collections if they don't exist
    const requiredCollections = ['users', 'tasks', 'files'];
    const existingNames = collections.map(c => c.name);
    
    for (const name of requiredCollections) {
      if (!existingNames.includes(name)) {
        await db.createCollection(name);
        console.log(`✨ Created collection: ${name}`);
      }
    }

    // Test INSERT operations
    console.log('\n📝 Testing INSERT operations...\n');
    
    const timestamp = new Date().toISOString();
    
    const testUser = {
      id: `user-${Date.now()}`,
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      role: 'user',
      isApproved: true,
      createdAt: timestamp
    };
    
    const userResult = await db.collection('users').insertOne(testUser);
    console.log(`✅ User inserted with _id: ${userResult.insertedId}`);

    const testTask = {
      id: `task-${Date.now()}`,
      title: 'Sample Task',
      description: 'Testing MongoDB functionality',
      status: 'pending',
      reviewStatus: 'pending_review',
      createdBy: testUser.id,
      createdAt: timestamp
    };
    
    const taskResult = await db.collection('tasks').insertOne(testTask);
    console.log(`✅ Task inserted with _id: ${taskResult.insertedId}`);

    const testFile = {
      id: `file-${Date.now()}`,
      name: 'test-document.pdf',
      type: 'application/pdf',
      size: 2048,
      uploadedBy: testUser.id,
      reviewStatus: 'pending_review',
      uploadedAt: timestamp
    };
    
    const fileResult = await db.collection('files').insertOne(testFile);
    console.log(`✅ File inserted with _id: ${fileResult.insertedId}`);

    // Test FETCH operations
    console.log('\n📖 Testing FETCH operations...\n');

    const fetchedUser = await db.collection('users').findOne({ _id: userResult.insertedId });
    console.log(`✅ Fetched user: ${fetchedUser.name} (${fetchedUser.email})`);

    const fetchedTask = await db.collection('tasks').findOne({ _id: taskResult.insertedId });
    console.log(`✅ Fetched task: ${fetchedTask.title}`);

    const fetchedFile = await db.collection('files').findOne({ _id: fileResult.insertedId });
    console.log(`✅ Fetched file: ${fetchedFile.name}`);

    // Test COUNT operations
    console.log('\n📊 Collection Statistics:\n');

    const userCount = await db.collection('users').countDocuments();
    const taskCount = await db.collection('tasks').countDocuments();
    const fileCount = await db.collection('files').countDocuments();

    console.log(`   Users: ${userCount} document(s)`);
    console.log(`   Tasks: ${taskCount} document(s)`);
    console.log(`   Files: ${fileCount} document(s)`);

    // Test FIND ALL operations
    console.log('\n📋 Fetching all documents from each collection:\n');

    const allUsers = await db.collection('users').find().toArray();
    console.log(`   Users collection: ${allUsers.length} document(s)`);
    allUsers.slice(0, 2).forEach(user => {
      console.log(`      - ${user.name} (${user.role})`);
    });

    const allTasks = await db.collection('tasks').find().toArray();
    console.log(`\n   Tasks collection: ${allTasks.length} document(s)`);
    allTasks.slice(0, 2).forEach(task => {
      console.log(`      - ${task.title} [${task.status}]`);
    });

    const allFiles = await db.collection('files').find().toArray();
    console.log(`\n   Files collection: ${allFiles.length} document(s)`);
    allFiles.slice(0, 2).forEach(file => {
      console.log(`      - ${file.name} (${file.size} bytes)`);
    });

    console.log('\n✅ All database operations completed successfully!');
    console.log('\n🎉 MongoDB is properly saving and fetching data!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed.');
  }
}

// Run the test
testDatabase();
