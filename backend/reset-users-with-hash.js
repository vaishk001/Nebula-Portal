/**
 * Reset existing users and recreate with hashed passwords
 * This script will:
 * 1. Remove all existing users
 * 2. Create default admin and user with bcrypt hashed passwords
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = 'mongodb://127.0.0.1:27017/nebula';
const client = new MongoClient(uri);
const SALT_ROUNDS = 10;

async function resetUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    const db = client.db('nebula');
    const usersCollection = db.collection('users');

    // Show current users
    const currentUsers = await usersCollection.find().toArray();
    console.log('📊 Current users in database:');
    currentUsers.forEach(u => {
      const pwdPreview = u.password ? u.password.substring(0, 20) : 'NO PASSWORD';
      console.log(`   - ${u.email} (${u.role}) - Password: ${pwdPreview}...`);
    });
    console.log(`   Total: ${currentUsers.length} users\n`);

    // Delete all users
    console.log('🗑️  Removing all existing users...');
    const deleteResult = await usersCollection.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} user(s)\n`);

    // Create new users with hashed passwords
    console.log('🔐 Creating new users with hashed passwords...\n');

    const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
    console.log('   ✓ Admin password hashed');
    
    const userPassword = await bcrypt.hash('user123', SALT_ROUNDS);
    console.log('   ✓ User password hashed\n');

    const defaultUsers = [
      {
        id: 'admin-1',
        email: 'admin@nebula.com',
        password: adminPassword,
        role: 'admin',
        name: 'Admin User',
        isApproved: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-1',
        email: 'user@nebula.com',
        password: userPassword,
        role: 'user',
        name: 'Regular User',
        isApproved: true,
        createdAt: new Date().toISOString()
      }
    ];

    const result = await usersCollection.insertMany(defaultUsers);
    console.log(`✅ Created ${result.insertedCount} users with hashed passwords\n`);

    // Verify passwords are hashed
    console.log('🔍 Verifying password hashing:');
    const verifyUsers = await usersCollection.find().toArray();
    for (const user of verifyUsers) {
      const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
      console.log(`   ${user.email}: ${isHashed ? '✅ HASHED' : '❌ PLAIN TEXT'}`);
      console.log(`      Hash: ${user.password.substring(0, 60)}...`);
    }

    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@nebula.com / admin123');
    console.log('   User:  user@nebula.com / user123');
    console.log('\n✅ Password reset complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.close();
    console.log('🔒 Connection closed.');
  }
}

// Run the reset
console.log('🚀 Starting user reset with password hashing...\n');
resetUsers();
