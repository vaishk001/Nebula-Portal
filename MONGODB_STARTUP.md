# MongoDB Startup Guide for Windows

## Problem
MongoDB Compass shows connection error, and backend can't connect to database.

## Solution - Start MongoDB

### Option 1: Start as Windows Service (Recommended)
Open PowerShell or Command Prompt **as Administrator** and run:

```cmd
net start MongoDB
```

### Option 2: Start mongod.exe Directly
If MongoDB is not installed as a service:

```cmd
"C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe" --dbpath "C:\data\db"
```

Replace `<version>` with your MongoDB version (e.g., 7.0, 6.0, 5.0)

### Option 3: Check MongoDB Installation Path

```powershell
Get-ChildItem "C:\Program Files\MongoDB" -Recurse -Filter mongod.exe
```

## Verify MongoDB is Running

After starting MongoDB, verify it's listening:

```powershell
Get-NetTCPConnection -LocalPort 27017
```

You should see:
```
LocalAddress  LocalPort State
------------  --------- -----
127.0.0.1     27017     Listen
```

## Then Run These Steps

### 1. Reset Users with Hashed Passwords
```bash
cd backend
node reset-users-with-hash.js
```

This will:
- Delete all existing users
- Create admin@nebula.com / admin123 (hashed)
- Create user@nebula.com / user123 (hashed)

### 2. Start Backend Server
```bash
node server.js
```

You should see:
```
✅ Connected to MongoDB successfully
🚀 Database initialized and ready
```

### 3. Test Login
- Go to http://localhost:8080
- Login with: admin@nebula.com / admin123
- Or: user@nebula.com / user123

## Common Issues

### "Access is denied" when starting service
- Run PowerShell/CMD as Administrator
- Right-click → "Run as administrator"

### MongoDB not installed as service
Install it:
```cmd
"C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe" --install --serviceName MongoDB
```

### Data directory doesn't exist
Create it:
```cmd
mkdir C:\data\db
```

## Quick Check - Is MongoDB Running?

Run this command:
```powershell
Get-Process -Name mongod -ErrorAction SilentlyContinue
```

If you see mongod process, MongoDB is running!
If not, follow Option 1 or 2 above.
