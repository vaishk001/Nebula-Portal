
require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nebula';
const client = new MongoClient(uri);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('nebula');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Users API
app.get('/api/users', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (error) {
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
    const db = await connectToMongoDB();
    const result = await db.collection('users').insertOne(req.body);
    res.status(201).json({ ...req.body, _id: result.insertedId });
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

// Files API
app.get('/api/files', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const files = await db.collection('files').find().toArray();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/files', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const result = await db.collection('files').insertOne(req.body);
    res.status(201).json({ ...req.body, _id: result.insertedId.toString() });
  } catch (error) {
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
  const envContent = 'MONGODB_URI=mongodb://localhost:27017/nebula\nPORT=5000';
  fs.writeFileSync(envFilePath, envContent);
  console.log('Created sample .env file');
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
