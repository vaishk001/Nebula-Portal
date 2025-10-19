
# Nebula Project

A secure task and file management system with role-based access control.

## Project Structure

This project is divided into two main components:

- **Frontend**: React application with TypeScript, Vite, and Tailwind CSS
- **Backend**: Express.js server with MongoDB for data storage

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [MongoDB](https://www.mongodb.com/try/download/community) (local installation or MongoDB Atlas account)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following content:
```
MONGODB_URI=mongodb://localhost:27017/nebula
PORT=5000
```

Replace the MongoDB URI with your own connection string if using MongoDB Atlas.

4. Start the backend server:
```bash
npm run dev
```

The backend will start on port 5000 (or the port specified in your .env file).

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on port 8080 and will automatically proxy API requests to the backend.

## MongoDB Connection with MongoDB Compass

1. Download and install [MongoDB Compass](https://www.mongodb.com/products/compass) from the official website.

2. Launch MongoDB Compass.

3. In the connection dialog, enter:
   - For local MongoDB: `mongodb://localhost:27017`
   - For MongoDB Atlas: Your connection string from Atlas

4. Click "Connect".

5. In the databases list, you should see "nebula" once data has been added to it.

6. Within the "nebula" database, you'll find collections for "users", "tasks", and "files".

## Features

- User authentication with role-based access (admin/user)
- Task management with assignment capability
- Secure file storage with end-to-end encryption
- Password-protected files
- MongoDB integration for data persistence

## Project Codebase

- `frontend/src`: Frontend React application
- `backend`: Express.js server, API routes, and MongoDB connection

## Important Notes

- For development, files are temporarily stored using localStorage and URL.createObjectURL
- In production, actual file storage should be implemented (e.g., MongoDB GridFS or cloud storage)
- Encryption in this demo is simulated; real encryption would be implemented with actual cryptographic libraries
