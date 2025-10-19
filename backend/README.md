
# Nebula Backend

This is the backend service for the Nebula application. It provides API endpoints for users, tasks, and file management.

## Setup Instructions

1. Install dependencies:
```
npm install
```

2. Create a `.env` file in the backend directory with the following content:
```
MONGODB_URI=mongodb://localhost:27017/nebula
PORT=5000
```

3. Start the server:
```
npm run dev
```

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `POST /api/users` - Create a new user

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task

### Files
- `GET /api/files` - Get all files
- `GET /api/files/:id` - Get a specific file
- `POST /api/files` - Create a new file
- `DELETE /api/files/:id` - Delete a file
