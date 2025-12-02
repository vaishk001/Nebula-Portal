# File Visibility & Upload Flow

## Overview

The file upload and visibility system now works correctly across all user roles with proper MongoDB integration.

## File Flow

### User → Manager → Admin

```
┌────────────┐         ┌─────────────┐         ┌─────────┐
│   USER     │ upload  │   MANAGER   │ upload  │  ADMIN  │
│            │ ──────> │             │ ──────> │         │
│ - Upload   │         │ - Review    │         │ - View  │
│   files    │         │   user      │         │   all   │
│            │         │   files     │         │   files │
│ - View own │         │ - Upload    │         │         │
│   files    │         │   files     │         │         │
└────────────┘         └─────────────┘         └─────────┘
```

## Role-Based Visibility

### Regular User

- **Can Upload**: ✅ Yes
- **Can See**: Only their own files
- **Files Go To**: Manager for review
- **Status**: Files marked as "pending_review"

### Manager

- **Can Upload**: ✅ Yes
- **Can See**:
  - Their own files
  - All files uploaded by regular users
- **Files Go To**: Admin for review
- **Review Power**: Can approve/revert user files in the Manager Review Panel
- **Status**: Manager files marked as "pending_review" for admin

### Admin

- **Can Upload**: ❌ No (view-only mode)
- **Can See**: All files from all users (users + managers)
- **Review Power**: Full visibility for oversight

## Technical Implementation

### SecureFilesPage.tsx

- Uses `getFiles()` API to load all files from MongoDB
- Filters files based on user role:
  - **Users**: `file.uploadedBy === user.id`
  - **Managers**: Files where `fileOwner.role === 'user'` (plus their own)
  - **Admins**: All files

### ManagerReview.tsx

- Loads files using API: `getFiles()`, `getUsers()`
- Shows only user-uploaded files pending review
- Updates review status via `reviewFile()` API
- Automatically refreshes after approval/rejection

### API Endpoints Used

#### GET /api/files

- Returns all files from MongoDB
- Frontend filters based on role

#### POST /api/files

- Creates new file entry
- Automatically sets `uploadedBy`, `uploadedAt`, `reviewStatus`

#### PUT /api/files/:id/review

- Updates file review status
- Sets `reviewStatus`, `reviewedBy`, `reviewComment`

## File Upload Process

1. **User uploads file**:

   - File saved to MongoDB with `reviewStatus: 'pending_review'`
   - Appears in "User Files for Review" section for managers
   - Toast: "File uploaded and sent for manager review"

2. **Manager reviews file**:

   - Can approve → Status changes to `'approved'`
   - Can revert → Status changes to `'reverted'`, must add comment
   - User sees status badge on their file

3. **Manager uploads file**:

   - File saved to MongoDB with `reviewStatus: 'pending_review'`
   - Appears in admin's "All User Files" view
   - Toast: "File uploaded and sent for admin review"

4. **Admin views all files**:
   - Sees files from both users and managers
   - Full oversight capability

## Testing the Flow

### Test as User

1. Login as `user@nebula.com`
2. Go to "Encrypted Files" page
3. Upload a file → Should see "pending review" badge
4. File should appear in your files list

### Test as Manager

1. Login as approved manager account
2. Go to Dashboard → "Manager Review Panel"
3. Should see user's uploaded file in "Files" tab
4. Approve or revert the file
5. Go to "Encrypted Files" → Upload your own file
6. Should see "sent for admin review" message

### Test as Admin

1. Login as `admin@nebula.com`
2. Go to "Encrypted Files" page
3. Should see "All User Files (Admin View)" section
4. Should see files from both regular users AND managers

## Key Changes Made

### frontend/src/pages/SecureFilesPage.tsx

- ✅ Uses `getFiles()` and `createFile()` API instead of direct MongoDB
- ✅ Managers can now upload files
- ✅ Managers see user-uploaded files in review section
- ✅ Admins see all files (users + managers)
- ✅ Proper role-based filtering

### frontend/src/components/dashboard/ManagerReview.tsx

- ✅ Uses `getFiles()`, `getTasks()`, `getUsers()` APIs
- ✅ Uses `reviewFile()` API for approvals
- ✅ Filters files to show only user-uploaded files
- ✅ Async/await for all API calls

### frontend/src/utils/api.ts

- ✅ Added `reviewFile()` function for file review workflow

## Database Structure

### Files Collection

```typescript
{
  _id: string,
  name: string,
  type: string,
  size: number,
  url: string,
  description?: string,
  uploadedBy: string,        // User ID
  uploadedAt: string,        // ISO timestamp
  reviewStatus: 'pending_review' | 'approved' | 'reverted',
  reviewedBy?: string,       // Manager/Admin ID
  reviewComment?: string,    // Feedback
  encryptionDetails?: {
    passwordProtected: boolean,
    passwordHash?: string
  }
}
```

## Troubleshooting

### Files not showing for manager

- **Check**: Is backend server running? (`node backend/server.js`)
- **Check**: Is file uploaded by a user (not another manager)?
- **Check**: Is file status `pending_review`?

### Manager can't upload files

- **Check**: Manager role is approved (`isApproved: true`)
- **Check**: Page should show upload section for managers

### Admin can't see manager files

- **Check**: Backend server is running
- **Check**: Files exist in MongoDB (`db.files.find()` in mongo shell)
- **Check**: Admin page loads "All User Files" section

## Summary

✅ **Users upload** → Managers review → Files visible to managers
✅ **Managers upload** → Admins see → Files visible to admins
✅ All operations use **MongoDB API** (no localStorage dependency)
✅ Proper **role-based visibility** enforced
✅ **Review workflow** functional for managers
