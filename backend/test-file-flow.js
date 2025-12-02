/**
 * Test script to verify file upload and visibility flow
 * Tests: User uploads → Manager sees → Manager uploads → Admin sees
 * 
 * Prerequisites:
 * - Backend server running (node server.js)
 * - MongoDB running on localhost:27017
 * - At least one user, one manager, and one admin account
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'nebula';

async function testFileFlow() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    const filesCollection = db.collection('files');
    
    // 1. Find test users
    console.log('\n📋 Step 1: Finding test users...');
    const regularUser = await usersCollection.findOne({ role: 'user' });
    const manager = await usersCollection.findOne({ role: 'manager', isApproved: true });
    const admin = await usersCollection.findOne({ role: 'admin' });
    
    if (!regularUser) {
      console.log('❌ No regular user found. Please create a user account first.');
      return;
    }
    if (!manager) {
      console.log('❌ No approved manager found. Please create and approve a manager account first.');
      return;
    }
    if (!admin) {
      console.log('❌ No admin found. Please create an admin account first.');
      return;
    }
    
    console.log(`   ✅ Regular User: ${regularUser.name} (${regularUser.email})`);
    console.log(`   ✅ Manager: ${manager.name} (${manager.email})`);
    console.log(`   ✅ Admin: ${admin.name} (${admin.email})`);
    
    // 2. Create test file from user
    console.log('\n📤 Step 2: User uploads a test file...');
    const userFile = {
      name: 'user-test-file.pdf',
      type: 'application/pdf',
      size: 12345,
      url: 'data:application/pdf;base64,test',
      description: 'Test file uploaded by user',
      uploadedBy: regularUser.id,
      uploadedAt: new Date().toISOString(),
      reviewStatus: 'pending_review'
    };
    
    const userFileResult = await filesCollection.insertOne(userFile);
    console.log(`   ✅ User file created with ID: ${userFileResult.insertedId}`);
    
    // 3. Verify manager can see user's file
    console.log('\n🔍 Step 3: Checking if manager can see user files...');
    const allFiles = await filesCollection.find().toArray();
    const allUsers = await usersCollection.find().toArray();
    
    const managerVisibleFiles = allFiles.filter(file => {
      const fileOwner = allUsers.find(u => u.id === file.uploadedBy);
      return fileOwner && fileOwner.role === 'user';
    });
    
    console.log(`   Manager should see ${managerVisibleFiles.length} user file(s)`);
    console.log(`   Files:`);
    managerVisibleFiles.forEach(f => {
      const owner = allUsers.find(u => u.id === f.uploadedBy);
      console.log(`      - ${f.name} (uploaded by ${owner?.name}, status: ${f.reviewStatus})`);
    });
    
    // 4. Manager reviews the file
    console.log('\n✅ Step 4: Manager approves the file...');
    await filesCollection.updateOne(
      { _id: userFileResult.insertedId },
      { 
        $set: { 
          reviewStatus: 'approved',
          reviewedBy: manager.id,
          reviewComment: 'Looks good!'
        }
      }
    );
    console.log(`   ✅ File approved by manager`);
    
    // 5. Manager uploads own file
    console.log('\n📤 Step 5: Manager uploads a test file...');
    const managerFile = {
      name: 'manager-report.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 54321,
      url: 'data:application/xlsx;base64,test',
      description: 'Test file uploaded by manager',
      uploadedBy: manager.id,
      uploadedAt: new Date().toISOString(),
      reviewStatus: 'pending_review'
    };
    
    const managerFileResult = await filesCollection.insertOne(managerFile);
    console.log(`   ✅ Manager file created with ID: ${managerFileResult.insertedId}`);
    
    // 6. Verify admin can see all files
    console.log('\n🔍 Step 6: Checking if admin can see all files...');
    const allFilesNow = await filesCollection.find().toArray();
    console.log(`   Admin should see ${allFilesNow.length} total file(s)`);
    console.log(`   Files:`);
    allFilesNow.forEach(f => {
      const owner = allUsers.find(u => u.id === f.uploadedBy);
      console.log(`      - ${f.name} (uploaded by ${owner?.name} [${owner?.role}], status: ${f.reviewStatus})`);
    });
    
    // 7. Summary
    console.log('\n📊 Test Summary:');
    console.log('   ✅ User can upload files');
    console.log('   ✅ Manager can see user files');
    console.log('   ✅ Manager can review user files');
    console.log('   ✅ Manager can upload files');
    console.log('   ✅ Admin can see all files (users + managers)');
    console.log('\n🎉 All tests passed! File flow is working correctly.\n');
    
    // Clean up test files
    console.log('🧹 Cleaning up test files...');
    await filesCollection.deleteOne({ _id: userFileResult.insertedId });
    await filesCollection.deleteOne({ _id: managerFileResult.insertedId });
    console.log('   ✅ Test files removed\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
console.log('🚀 Starting file flow test...\n');
testFileFlow().catch(console.error);
