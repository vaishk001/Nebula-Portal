# 🔴 IMPORTANT: How to Fix the 500 Error

## The Problem

You're getting a 500 error because the **backend server is not running**.

## The Solution

### Step 1: Start Backend Server

Open a **NEW PowerShell terminal** and run:

```powershell
cd C:\Users\DELL\OneDrive\Desktop\nebula-portal-TSM-main\backend
node server.js
```

**KEEP THIS TERMINAL OPEN!** Don't close it.

You should see:

```
✅ Connected to MongoDB successfully
🚀 Database initialized and ready
```

### Step 2: Start Frontend (in a DIFFERENT terminal)

Open **ANOTHER PowerShell terminal** and run:

```powershell
cd C:\Users\DELL\OneDrive\Desktop\nebula-portal-TSM-main\frontend
npm run dev
```

### Step 3: Test

Go to: http://localhost:8080

Now try to create an account - it should work!

## Why You Got the Error

The error logs show:

```
Failed to load resource: the server responded with a status of 500
```

This happens when:

1. Backend server is not running ❌
2. MongoDB is not connected ❌
3. Backend crashes before frontend connects ❌

## Verify Backend is Running

In a terminal, run:

```powershell
Invoke-RestMethod http://localhost:5000/api/test
```

Should return:

```
message
-------
Backend server is running!
```

If you get an error, the backend is NOT running.

## Quick Checklist

- [ ] MongoDB is running (check MongoDB Compass connection)
- [ ] Backend server is running on port 5000
- [ ] Frontend is running on port 8080
- [ ] You have TWO terminal windows open (one for backend, one for frontend)

## If Still Getting Errors

Check backend terminal for error messages like:

- `Cannot connect to MongoDB` → Start MongoDB service
- `Port 5000 already in use` → Kill the process using port 5000
- `Module not found` → Run `npm install` in backend folder

---

**The key is: BOTH backend AND frontend must be running at the same time!**
