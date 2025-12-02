# Nebula Portal - Complete Testing Guide

## ✅ FIXED: MongoDB Connection Issue

### Problem Identified

The frontend was saving user accounts to **localStorage** instead of MongoDB database.

### Solution Implemented

- Updated `AuthForm.tsx` to use MongoDB API (`getUsers`, `createUser`)
- Users now fetch from and save to MongoDB via backend API
- Removed localStorage dependency for user data
- Added proper error handling and loading states

## 🚀 How to Start the Application

### Step 1: Start Backend Server

```powershell
cd C:\Users\DELL\OneDrive\Desktop\nebula-portal-TSM-main\backend
node server.js
```

Or use the batch file:

```powershell
cd C:\Users\DELL\OneDrive\Desktop\nebula-portal-TSM-main\backend
.\start-server.bat
```

You should see:

```
🌟 Server running on port 5000
📡 API available at http://localhost:5000
✅ Connected to MongoDB successfully
📊 Database: nebula
✓ Collection exists: users
✓ Collection exists: tasks
✓ Collection exists: files
🚀 Database initialized and ready
```

### Step 2: Start Frontend

In a new terminal:

```powershell
cd C:\Users\DELL\OneDrive\Desktop\nebula-portal-TSM-main\frontend
npm run dev
```

The frontend will be available at: **http://localhost:8080**

## 🧪 Testing User Creation & Fetching

### Test 1: Verify Default Users Exist

With backend running, open: http://localhost:5000/api/users

You should see 4 users including:

- `admin@nebula.com` (Admin)
- `user@nebula.com` (Regular User)
- 2 test users from earlier tests

### Test 2: Create New Account via Frontend

1. Go to http://localhost:8080
2. Click "Sign Up"
3. Fill in:
   - Name: John Doe
   - Email: john@example.com
   - Password: test123
   - Role: User
4. Click "Create Account"
5. You should see: "Account created successfully! Please login."

### Test 3: Verify User Was Saved to MongoDB

**Option A: Via API**

```powershell
# In PowerShell (with backend running)
Invoke-RestMethod http://localhost:5000/api/users |
  Where-Object { $_.email -eq 'john@example.com' }
```

**Option B: Via MongoDB Compass**

1. Open MongoDB Compass
2. Connect to: `localhost:27017`
3. Navigate to: `nebula` database → `users` collection
4. You should see the new user with email: john@example.com

**Option C: Via Test Script**

```powershell
cd C:\Users\DELL\OneDrive\Desktop\nebula-portal-TSM-main\backend
node test-db.js
```

### Test 4: Login with Created Account

1. Go to http://localhost:8080
2. Enter the credentials you created
3. Click "Sign In"
4. You should be redirected to the dashboard

### Test 5: Create Manager Account

1. Sign up with role: "Manager"
2. Login as admin (`admin@nebula.com` / `admin123`)
3. Go to Dashboard → Approve the manager
4. Manager can now login

## 🔍 Debugging Connection Issues

### Check if Backend is Running

```powershell
# Test if server responds
Invoke-RestMethod http://localhost:5000/api/test
# Should return: {"message":"Backend server is running!"}
```

### Check Database Status

```powershell
Invoke-RestMethod http://localhost:5000/api/debug/db-status
```

Expected response:

```json
{
  "status": "connected",
  "database": "nebula",
  "collections": {
    "users": { "count": 4, "exists": true },
    "tasks": { "count": 2, "exists": true },
    "files": { "count": 2, "exists": true }
  }
}
```

### View All Users in Database

```powershell
Invoke-RestMethod http://localhost:5000/api/users |
  Select-Object name, email, role, isApproved |
  Format-Table
```

### Create Test User via API

```powershell
$newUser = @{
  id = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"
  name = "API Test User"
  email = "apitest@example.com"
  password = "test123"
  role = "user"
  isApproved = $true
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri http://localhost:5000/api/users `
  -Body $newUser `
  -ContentType 'application/json'
```

## 📊 Current Database State

After running `node init-users.js`, you have:

**Users Collection:**

- admin@nebula.com (Admin, approved)
- user@nebula.com (User, approved)
- 2 test users from previous tests
- Any users you create via the frontend

**Tasks Collection:**

- 2 sample tasks

**Files Collection:**

- 2 sample files

## ✅ What's Fixed

1. **User Creation** ✅

   - Now saves to MongoDB via `/api/users` endpoint
   - No longer uses localStorage
   - Properly validates email and password

2. **User Fetching** ✅

   - Loads users from MongoDB on component mount
   - Real-time updates after user creation
   - Proper error handling

3. **Login** ✅

   - Fetches user data from MongoDB
   - Validates against database records
   - Checks manager approval status

4. **Manager Approval** ✅
   - Managers saved to MongoDB with `isApproved: false`
   - Admin can approve via dashboard
   - Blocked from login until approved

## 🔗 API Endpoints Working

- `GET /api/users` - Fetch all users ✅
- `POST /api/users` - Create new user ✅
- `GET /api/users/:id` - Get user by ID ✅
- `PUT /api/users/:id/approve` - Approve manager ✅
- `DELETE /api/users/:id/reject` - Reject manager ✅

## 📝 Quick Commands Reference

```powershell
# Start backend
cd backend; node server.js

# Initialize default users
cd backend; node init-users.js

# Test database
cd backend; node test-db.js

# Check all users
Invoke-RestMethod http://localhost:5000/api/users

# Check database status
Invoke-RestMethod http://localhost:5000/api/debug/db-status

# Create test user
Invoke-RestMethod -Method Post `
  -Uri http://localhost:5000/api/users `
  -Body '{"id":"u1","name":"Test","email":"t@t.com","password":"123456","role":"user","isApproved":true}' `
  -ContentType 'application/json'
```

## 🎉 Success Indicators

When everything is working correctly:

1. **Backend Console Shows:**

   ```
   ✅ Connected to MongoDB successfully
   📊 Database: nebula
   ✓ Collection exists: users
   🚀 Database initialized and ready
   ```

2. **Frontend Shows:**

   - No errors in browser console
   - Users can sign up successfully
   - Login redirects to dashboard
   - Toast notifications appear correctly

3. **MongoDB Compass Shows:**

   - Database: `nebula`
   - Collections: `users`, `tasks`, `files`
   - Documents visible in each collection

4. **API Responds:**
   ```powershell
   Invoke-RestMethod http://localhost:5000/api/users
   # Returns array of user objects
   ```

---

**Everything is now properly connected to MongoDB!** 🎊

Users created via the frontend are saved to and fetched from the MongoDB database.
