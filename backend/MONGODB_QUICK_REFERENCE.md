# Quick Reference: MongoDB Nebula Database

## 🎯 Summary

✅ **Database:** `nebula` - Successfully created and operational  
✅ **Collections:** `users`, `tasks`, `files` - All created and functional  
✅ **Data Storage:** Working - Currently 2 documents in each collection  
✅ **Data Retrieval:** Working - All fetch operations successful

## 🚀 Quick Commands

### Start Backend Server

```powershell
cd C:\Users\DELL\OneDrive\Desktop\nebula-portal-TSM-main\backend
node server.js
```

### Test Database (without server)

```powershell
cd C:\Users\DELL\OneDrive\Desktop\nebula-portal-TSM-main\backend
node test-db.js
```

### View in MongoDB Compass

1. Open MongoDB Compass
2. Connect to: `localhost:27017`
3. Select database: `nebula`
4. View collections: `users`, `tasks`, `files`

## 📊 Current Database State

```
nebula (database)
├── users (2 documents)
│   └── Stores user accounts with roles
├── tasks (2 documents)
│   └── Stores tasks with review workflow
└── files (2 documents)
    └── Stores file metadata
```

## ✅ Verified Features

- [x] Database connection established
- [x] All collections created automatically
- [x] INSERT operations working
- [x] FETCH operations working
- [x] UPDATE operations working (via API)
- [x] DELETE operations working (via API)
- [x] Data persists across restarts
- [x] Collection counts accurate
- [x] Document structure preserved

## 🔗 Connection Details

**URI:** `mongodb://localhost:27017/nebula`  
**Driver:** Native MongoDB Node.js driver  
**Connection:** Cached (reused across requests)  
**Auto-create:** Collections created on first server start

---

**Status:** ✅ All systems operational
