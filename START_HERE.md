# 🚀 Quick Start Guide

## Start the Application

### Terminal 1 - Backend Server

```powershell
cd C:\Users\DELL\OneDrive\Desktop\nebula-portal-TSM-main\backend
node server.js
```

Wait for:

```
✅ Connected to MongoDB successfully
🚀 Database initialized and ready
```

### Terminal 2 - Frontend

```powershell
cd C:\Users\DELL\OneDrive\Desktop\nebula-portal-TSM-main\frontend
npm run dev
```

Open: http://localhost:8080

## Test User Creation

1. Click "Sign Up"
2. Fill in details
3. Click "Create Account"
4. Check MongoDB Compass - your user should be there!

## Verify in MongoDB Compass

1. Connect to: `localhost:27017`
2. Database: `nebula`
3. Collection: `users`
4. You should see your created user

## Quick Test Commands

```powershell
# View all users
Invoke-RestMethod http://localhost:5000/api/users

# Check database
Invoke-RestMethod http://localhost:5000/api/debug/db-status
```

## Default Credentials

```
Admin: admin@nebula.com / admin123
User:  user@nebula.com / user123
```

---

**Everything is connected to MongoDB!** ✅
