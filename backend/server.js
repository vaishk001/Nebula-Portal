
require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

const SALT_ROUNDS = 10;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'https://nebula-portal-two.vercel.app',
    'https://nebula-portal.vercel.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nebula';

// Only add TLS options for mongodb+srv URIs
const clientOptions = uri.includes('mongodb+srv') 
  ? {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    }
  : {};

const client = new MongoClient(uri, clientOptions);
let cachedDb = null;

async function connectToMongoDB() {
  if (cachedDb) {
    return cachedDb;
  }
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    const db = client.db('nebula');
    
    // Ensure required collections exist
    const requiredCollections = ['users', 'tasks', 'files'];
    const existingCollections = (await db.listCollections().toArray()).map(c => c.name);
    
    console.log(`📊 Database: ${db.databaseName}`);
    console.log(`📁 Existing collections: ${existingCollections.join(', ') || 'none'}`);
    
    for (const name of requiredCollections) {
      if (!existingCollections.includes(name)) {
        await db.createCollection(name);
        console.log(`✨ Created collection: ${name}`);
      } else {
        console.log(`✓ Collection exists: ${name}`);
      }
    }
    
    cachedDb = db;
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

// Initialize connection on server start
let dbInitialized = false;
async function initializeDatabase() {
  if (!dbInitialized) {
    await connectToMongoDB();
    dbInitialized = true;
    console.log('🚀 Database initialized and ready');
  }
}

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Debug: Database status (counts of main collections)
app.get('/api/debug/db-status', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const collections = ['users', 'tasks', 'files'];
    const stats = {};
    
    for (const name of collections) {
      try {
        const count = await db.collection(name).countDocuments();
        const sampleDocs = await db.collection(name).find().limit(2).toArray();
        stats[name] = {
          count,
          exists: true,
          sample: sampleDocs.map(doc => ({ _id: doc._id, ...Object.keys(doc).slice(0, 3).reduce((obj, key) => ({ ...obj, [key]: doc[key] }), {}) }))
        };
      } catch (e) {
        stats[name] = { count: 0, exists: false, error: e.message };
      }
    }
    
    res.json({
      status: 'connected',
      database: db.databaseName,
      uri: uri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
      collections: stats,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      serverTime: new Date().toISOString()
    });
  }
});

// Debug: Test data insertion and retrieval
app.post('/api/debug/test-insert', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const timestamp = new Date().toISOString();
    
    // Insert test documents
    const testUser = {
      id: `test-user-${Date.now()}`,
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      role: 'user',
      isApproved: true,
      createdAt: timestamp
    };
    
    const testTask = {
      id: `test-task-${Date.now()}`,
      title: 'Test Task',
      description: 'Testing MongoDB connectivity',
      status: 'pending',
      reviewStatus: 'pending_review',
      createdBy: testUser.id,
      createdAt: timestamp
    };
    
    const testFile = {
      id: `test-file-${Date.now()}`,
      name: 'test-document.txt',
      type: 'text/plain',
      size: 1024,
      uploadedBy: testUser.id,
      reviewStatus: 'pending_review',
      uploadedAt: timestamp
    };
    
    const userResult = await db.collection('users').insertOne(testUser);
    const taskResult = await db.collection('tasks').insertOne(testTask);
    const fileResult = await db.collection('files').insertOne(testFile);
    
    // Verify insertion by fetching back
    const insertedUser = await db.collection('users').findOne({ _id: userResult.insertedId });
    const insertedTask = await db.collection('tasks').findOne({ _id: taskResult.insertedId });
    const insertedFile = await db.collection('files').findOne({ _id: fileResult.insertedId });
    
    res.json({
      message: 'Test data inserted and verified successfully',
      inserted: {
        user: { _id: userResult.insertedId, verified: !!insertedUser },
        task: { _id: taskResult.insertedId, verified: !!insertedTask },
        file: { _id: fileResult.insertedId, verified: !!insertedFile }
      },
      data: {
        user: insertedUser,
        task: insertedTask,
        file: insertedFile
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Users API
app.get('/api/users', async (req, res) => {
  try {
    console.log('📖 GET /api/users');
    const db = await connectToMongoDB();
    const users = await db.collection('users').find().toArray();
    console.log(`✅ Retrieved ${users.length} users`);
    // Log manager approval status
    const managers = users.filter(u => u.role === 'manager');
    if (managers.length > 0) {
      console.log('Managers:', managers.map(m => ({ 
        name: m.name, 
        email: m.email, 
        isApproved: m.isApproved 
      })));
    }
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    console.log('📝 POST /api/users - Creating new user:', req.body.email);
    const db = await connectToMongoDB();
    
    // Check for duplicate email
    const existingUser = await db.collection('users').findOne({ email: req.body.email });
    if (existingUser) {
      console.log('⚠️  User already exists:', req.body.email);
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    console.log('🔒 Password hashed successfully');
    
    // Add timestamp if not present and hash password
    const userData = {
      ...req.body,
      password: hashedPassword,
      createdAt: req.body.createdAt || new Date().toISOString()
    };
    
    const result = await db.collection('users').insertOne(userData);
    console.log('✅ User created with _id:', result.insertedId);
    
    // Return user without password
    const { password, ...userWithoutPassword } = userData;
    res.status(201).json({ ...userWithoutPassword, _id: result.insertedId });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    console.log('🔐 POST /api/login - Login attempt for:', req.body.email);
    const db = await connectToMongoDB();
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('⚠️  Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Compare password with hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check manager approval status
    if (user.role === 'manager' && user.isApproved === false) {
      console.log('⚠️  Manager not approved yet:', email);
      return res.status(403).json({ error: 'Your manager account is pending admin approval' });
    }
    
    console.log('✅ Login successful for:', email, '- Role:', user.role);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve manager signup
app.put('/api/users/:id/approve', async (req, res) => {
  try {
    console.log('📝 Approving manager with id:', req.params.id);
    const db = await connectToMongoDB();
    
    // First check if user exists
    const existingUser = await db.collection('users').findOne({ id: req.params.id });
    console.log('Found user before approval:', existingUser);
    
    const result = await db.collection('users').updateOne(
      { id: req.params.id },
      { $set: { isApproved: true } }
    );
    
    console.log('Update result:', result);
    
    if (result.matchedCount === 0) {
      console.log('❌ User not found with id:', req.params.id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fetch updated user to confirm
    const updatedUser = await db.collection('users').findOne({ id: req.params.id });
    console.log('✅ User after approval:', updatedUser);
    
    res.json({ message: 'Manager approved successfully', user: updatedUser });
  } catch (error) {
    console.error('❌ Error approving manager:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject manager signup
app.delete('/api/users/:id/reject', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const result = await db.collection('users').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Manager request rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SSO - Find user by provider
app.get('/api/users/sso/:provider/:providerId', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({
      provider: req.params.provider,
      providerId: req.params.providerId
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SSO - Create or update user
app.post('/api/users/sso', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const { email, provider, providerId } = req.body;
    
    // Check if user exists
    const existingUser = await db.collection('users').findOne({
      $or: [
        { provider, providerId },
        { email }
      ]
    });
    
    if (existingUser) {
      // Update existing user with SSO info
      const result = await db.collection('users').updateOne(
        { _id: existingUser._id },
        { $set: { provider, providerId, ssoLinked: true } }
      );
      res.json({ ...existingUser, provider, providerId, ssoLinked: true });
    } else {
      // Create new SSO user
      const newUser = {
        ...req.body,
        ssoLinked: true,
        isApproved: true, // SSO users are auto-approved
        role: req.body.role || 'user',
        createdAt: new Date().toISOString()
      };
      const result = await db.collection('users').insertOne(newUser);
      res.status(201).json({ ...newUser, _id: result.insertedId });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SSO - Validate session
app.post('/api/sso/validate', async (req, res) => {
  try {
    const { token, userId } = req.body;
    
    if (!token || !userId) {
      return res.status(400).json({ error: 'Missing token or userId' });
    }
    
    // In production, validate token with actual auth service
    // For now, just check if user exists
    const db = await connectToMongoDB();
    const user = await db.collection('users').findOne({ id: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ valid: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tasks API
app.get('/api/tasks', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const tasks = await db.collection('tasks').find().toArray();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const task = await db.collection('tasks').findOne({ id: req.params.id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const result = await db.collection('tasks').insertOne(req.body);
    res.status(201).json({ ...req.body, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const result = await db.collection('tasks').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manager review task (approve/revert)
app.put('/api/tasks/:id/review', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const { reviewStatus, reviewedBy, reviewComment } = req.body;
    const result = await db.collection('tasks').updateOne(
      { id: req.params.id },
      { $set: { reviewStatus, reviewedBy, reviewComment } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task review updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Files API
app.get('/api/files', async (req, res) => {
  try {
    console.log('📁 GET /api/files - Fetching all files');
    const db = await connectToMongoDB();
    const files = await db.collection('files').find().toArray();
    console.log(`   Found ${files.length} files in database`);
    
    // Log file statistics
    const pendingCount = files.filter(f => f.reviewStatus === 'pending_review').length;
    const approvedCount = files.filter(f => f.reviewStatus === 'approved').length;
    const revertedCount = files.filter(f => f.reviewStatus === 'reverted').length;
    console.log(`   Status: ${pendingCount} pending, ${approvedCount} approved, ${revertedCount} reverted`);
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/files', async (req, res) => {
  try {
    console.log('📤 POST /api/files - New file upload');
    console.log(`   File: ${req.body.name}, Size: ${req.body.size} bytes`);
    console.log(`   Uploaded by: ${req.body.uploadedBy}, Status: ${req.body.reviewStatus}`);
    
    const db = await connectToMongoDB();
    const result = await db.collection('files').insertOne(req.body);
    
    console.log(`   ✅ File saved with ID: ${result.insertedId}`);
    res.status(201).json({ ...req.body, _id: result.insertedId.toString() });
  } catch (error) {
    console.error('   ❌ Error saving file:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files/:id', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const file = await db.collection('files').findOne({ 
      $or: [
        { _id: req.params.id },
        { _id: new ObjectId(req.params.id) }
      ] 
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/files/:id', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const result = await db.collection('files').deleteOne({ 
      $or: [
        { _id: req.params.id },
        { _id: new ObjectId(req.params.id) }
      ] 
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manager review file (approve/revert)
app.put('/api/files/:id/review', async (req, res) => {
  try {
    console.log(`🔍 PUT /api/files/${req.params.id}/review - File review`);
    const db = await connectToMongoDB();
    const { reviewStatus, reviewedBy, reviewComment } = req.body;
    
    console.log(`   Status: ${reviewStatus}, Reviewed by: ${reviewedBy}`);
    if (reviewComment) console.log(`   Comment: ${reviewComment}`);
    
    const result = await db.collection('files').updateOne(
      { $or: [
        { _id: req.params.id },
        { _id: new ObjectId(req.params.id) }
      ] },
      { $set: { reviewStatus, reviewedBy, reviewComment } }
    );
    
    if (result.matchedCount === 0) {
      console.log('   ❌ File not found');
      return res.status(404).json({ error: 'File not found' });
    }
    
    console.log(`   ✅ File review updated successfully`);
    res.json({ message: 'File review updated' });
  } catch (error) {
    console.error('   ❌ Error updating review:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// File download endpoint
app.get('/api/download/:id', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const file = await db.collection('files').findOne({
      $or: [
        { _id: req.params.id },
        { _id: new ObjectId(req.params.id) }
      ]
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // In a real implementation, you would decrypt the file here if needed
    
    // For local testing, we can't use blob URLs directly since they only work on the client side
    // Instead, set appropriate headers for downloading
    res.setHeader('Content-Type', file.type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    
    // For this example, if we have a local file path, send it
    const filePath = path.join(__dirname, 'uploads', file._id.toString());
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    
    // If we don't have a local file, send a sample file or error
    const samplePath = path.join(__dirname, 'uploads', 'sample.txt');
    if (fs.existsSync(samplePath)) {
      return res.sendFile(samplePath);
    }
    
    // Create a sample file on the fly if needed
    fs.writeFileSync(samplePath, 'This is a sample file for demonstration purposes.');
    res.sendFile(samplePath);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Error downloading file' });
  }
});

// Create a sample .env file if it doesn't exist
const envFilePath = path.join(__dirname, '.env');
if (!fs.existsSync(envFilePath)) {
  const envContent = 'MONGODB_URI=mongodb://127.0.0.1:27017/nebula\nPORT=5000';
  fs.writeFileSync(envFilePath, envContent);
  console.log('Created sample .env file');
}

// Start server and initialize database
app.listen(PORT, async () => {
  console.log(`🌟 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log('');
  console.log('Initializing database connection...');
  await initializeDatabase();
  console.log('');
  console.log('✅ All systems ready!');
  console.log('');
  console.log('📍 Endpoints:');
  console.log(`   - GET  http://localhost:${PORT}/api/debug/db-status`);
  console.log(`   - POST http://localhost:${PORT}/api/debug/test-insert`);
  console.log(`   - GET  http://localhost:${PORT}/api/users`);
  console.log(`   - GET  http://localhost:${PORT}/api/tasks`);
  console.log(`   - GET  http://localhost:${PORT}/api/files`);
});
