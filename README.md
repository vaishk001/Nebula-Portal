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

- User authentication with role-based access (admin/manager/user)
- **Manager approval workflow**: Managers must be approved by admin before login
- **Task review system**: Managers can review, approve, or revert completed tasks
- **File review system**: Managers can review, approve, or revert uploaded files
- Task management with assignment capability
- Secure file storage with end-to-end encryption
- Password-protected files
- MongoDB integration for data persistence

## User Roles

### Admin

- Full system access
- Approve/reject manager signup requests
- Create and assign tasks to users
- View all users, tasks, and files
- Manage the entire team

### Manager (Requires Admin Approval)

- Review completed tasks from employees
- Approve or revert tasks with feedback
- Review uploaded files from employees
- Approve or revert files with comments
- Must be approved by admin before accessing the system

### User (Employee)

- Direct login (no approval needed)
- Complete assigned tasks
- Upload secure files
- View task/file review status
- Receive manager feedback on reverted items

## Project Codebase

- `frontend/src`: Frontend React application
  - `components/auth`: Authentication forms and file upload
  - `components/dashboard`: Dashboard components including manager review panels
  - `components/tasks`: Task management components
  - `pages`: Main application pages
  - `types.ts`: TypeScript type definitions for User, Task, and File entities
- `backend`: Express.js server, API routes, and MongoDB connection
  - Manager approval endpoints
  - Task and file review endpoints

## Workflow

### Manager Signup and Approval

1. User selects "Manager" role during signup
2. Account is created with `isApproved: false`
3. Manager cannot login until approved
4. Admin sees pending manager request in dashboard
5. Admin approves or rejects the request
6. Approved manager can now login

### Task Review Workflow

1. Admin assigns task to user (employee)
2. User completes the task (marks as complete)
3. Task status automatically set to `pending_review`
4. Manager sees task in review panel
5. Manager can:
   - **Approve**: Task stays completed
   - **Revert**: Task returns to incomplete with feedback
6. User sees review status and any feedback

### File Review Workflow

1. User uploads a secure file
2. File automatically set to `pending_review` status
3. Manager sees file in review panel
4. Manager can:
   - **Approve**: File is approved for use
   - **Revert**: File marked as reverted with feedback
5. User sees review status and any feedback

## Important Notes

- For development, files are temporarily stored using localStorage and URL.createObjectURL
- In production, actual file storage should be implemented (e.g., MongoDB GridFS or cloud storage)
- Encryption in this demo is simulated; real encryption would be implemented with actual cryptographic libraries
