// Initialize database with default admin and user accounts
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = 'mongodb://127.0.0.1:27017/nebula';
const client = new MongoClient(uri);
const SALT_ROUNDS = 10;

async function initializeDefaultUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    const db = client.db('nebula');
    const usersCollection = db.collection('users');

    // Check if default users already exist
    const adminExists = await usersCollection.findOne({ email: 'admin@nebula.com' });
    const userExists = await usersCollection.findOne({ email: 'user@nebula.com' });

    const defaultUsers = [];

    if (!adminExists) {
      console.log('🔐 Hashing admin password...');
      const hashedAdminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
      
      const adminUser = {
        id: 'admin-1',
        email: 'admin@nebula.com',
        password: hashedAdminPassword,
        role: 'admin',
        name: 'Admin User',
        isApproved: true,
        createdAt: new Date().toISOString()
      };
      defaultUsers.push(adminUser);
      console.log('📝 Will create admin user: admin@nebula.com');
    } else {
      console.log('✓ Admin user already exists');
    }

    if (!userExists) {
      console.log('🔐 Hashing user password...');
      const hashedUserPassword = await bcrypt.hash('user123', SALT_ROUNDS);
      
      const regularUser = {
        id: 'user-1',
        email: 'user@nebula.com',
        password: hashedUserPassword,
        role: 'user',
        name: 'Regular User',
        isApproved: true,
        createdAt: new Date().toISOString()
      };
      defaultUsers.push(regularUser);
      console.log('📝 Will create regular user: user@nebula.com');
    } else {
      console.log('✓ Regular user already exists');
    }

    if (defaultUsers.length > 0) {
      const result = await usersCollection.insertMany(defaultUsers);
      console.log(`\n✅ Inserted ${result.insertedCount} default user(s)`);
      console.log('\nDefault credentials:');
      console.log('  Admin: admin@nebula.com / admin123');
      console.log('  User:  user@nebula.com / user123');
    } else {
      console.log('\n✅ All default users already exist');
    }

    // Show current user count
    const totalUsers = await usersCollection.countDocuments();
    console.log(`\n📊 Total users in database: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed.');
  }
}

// Run the initialization
initializeDefaultUsers();
