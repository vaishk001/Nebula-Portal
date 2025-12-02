# Manager Feature Documentation

## Overview

The Nebula Portal now includes a comprehensive Manager role system that enables workflow approval and quality control. Managers act as intermediaries between employees (users) and admins, reviewing and approving work before final acceptance.

## Manager Role Features

### 1. Manager Account Creation

- **Signup Process**:
  - Users can select "Manager" role during signup
  - Account is created but marked as `isApproved: false`
  - Manager cannot login until approved by admin
- **Admin Approval**:
  - Pending manager requests appear in admin dashboard
  - Admin can approve or reject requests
  - Rejected requests are deleted from the system
  - Approved managers can login immediately

### 2. Task Review System

#### For Employees (Users):

- Complete assigned tasks as normal
- When marking task as "Complete", status automatically becomes `pending_review`
- View review status badges:
  - 🟡 **Pending Review**: Task submitted, waiting for manager review
  - 🟢 **Approved**: Task approved by manager
  - 🔴 **Reverted**: Task sent back with feedback
- If reverted, see manager's feedback and fix issues before resubmitting

#### For Managers:

- Access "Manager Review Panel" in dashboard
- View all completed tasks pending review
- For each task:
  - See task details, description, and deadline
  - Add review comments (required for revert)
  - **Approve**: Keep task as complete
  - **Revert**: Send back to employee as incomplete with feedback
- Reverted tasks include comment explaining what needs fixing

### 3. File Review System

#### For Employees (Users):

- Upload files normally
- All uploaded files automatically set to `pending_review`
- View file review status:
  - 🟡 **Pending Review**: File uploaded, waiting for manager review
  - 🟢 **Approved**: File approved by manager
  - 🔴 **Reverted**: File rejected with feedback
- See manager comments on reverted files

#### For Managers:

- Access file review in "Manager Review Panel"
- View all uploaded files pending review
- For each file:
  - See file name, type, size, description
  - Preview file metadata
  - Add review comments (required for revert)
  - **Approve**: Accept the file
  - **Revert**: Reject file with feedback explaining issues

## Technical Implementation

### Database Schema Updates

#### User Model

```typescript
{
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  password: string;
  isApproved?: boolean; // For manager approval
}
```

#### Task Model

```typescript
{
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'complete' | 'incomplete';
  reviewStatus?: 'pending_review' | 'approved' | 'reverted';
  reviewedBy?: string; // Manager ID
  reviewComment?: string; // Feedback from manager
  // ... other fields
}
```

#### File Model

```typescript
{
  name: string;
  uploadedBy: string;
  reviewStatus?: 'pending_review' | 'approved' | 'reverted';
  reviewedBy?: string; // Manager ID
  reviewComment?: string; // Feedback from manager
  // ... other fields
}
```

### API Endpoints

#### Manager Approval

- `PUT /api/users/:id/approve` - Approve manager account
- `DELETE /api/users/:id/reject` - Reject manager request

#### Task Review

- `PUT /api/tasks/:id/review` - Update task review status
  - Body: `{ reviewStatus, reviewedBy, reviewComment }`

#### File Review

- `PUT /api/files/:id/review` - Update file review status
  - Body: `{ reviewStatus, reviewedBy, reviewComment }`

### Frontend Components

#### New Components

- `ManagerReview.tsx` - Main manager review panel with tabs for tasks and files
- `PendingManagers.tsx` - Admin component to approve/reject manager signups

#### Updated Components

- `AuthForm.tsx` - Added manager role option with approval notice
- `Dashboard.tsx` - Conditional rendering based on role (admin/manager/user)
- `TaskItem.tsx` - Display review status badges and manager feedback
- `TaskList.tsx` - Auto-set pending_review when completing tasks
- `SecureFilesPage.tsx` - Display file review status and feedback
- `UserList.tsx` - Show both users and approved managers

## User Flow Examples

### Example 1: Manager Signup

1. New user visits signup page
2. Selects "Nebula Manager (Requires Admin Approval)"
3. Fills in name, email, password
4. Clicks "Join Nebula"
5. Sees message: "Manager account created! Waiting for admin approval."
6. Attempts to login → Error: "Your manager account is pending admin approval"
7. Admin logs in, sees pending request
8. Admin clicks "Approve"
9. Manager can now login successfully

### Example 2: Task Review Process

1. Employee receives task assignment
2. Completes work and marks task as "Complete"
3. Task automatically set to "Pending Review" status
4. Manager logs in, sees task in review panel
5. Manager reviews work and finds issue
6. Manager adds comment: "Please update the documentation section"
7. Manager clicks "Revert to Employee"
8. Employee sees task back as "Incomplete" with red "Reverted" badge
9. Employee reads feedback, fixes issue
10. Employee marks complete again → Back to "Pending Review"
11. Manager reviews again, satisfied with changes
12. Manager clicks "Approve"
13. Task shows green "Approved" badge

### Example 3: File Review

1. Employee uploads encrypted file with description
2. File automatically set to "Pending Review"
3. Manager sees file in review panel
4. Manager checks file details
5. If incorrect format:
   - Manager adds comment: "Please upload in PDF format"
   - Manager clicks "Revert to Employee"
   - Employee sees red badge and feedback
6. If correct:
   - Manager clicks "Approve"
   - File shows green "Approved" badge

## Best Practices

### For Managers

- Always provide clear, actionable feedback when reverting
- Review items promptly to avoid bottlenecks
- Use the comment field to explain exactly what needs correction
- Approve items that meet quality standards

### For Employees

- Read manager feedback carefully when items are reverted
- Fix all issues mentioned before resubmitting
- Include detailed descriptions for files and tasks
- Check review status regularly

### For Admins

- Review manager approval requests carefully
- Only approve trusted individuals for manager role
- Monitor manager review activity
- Ensure managers are reviewing items in a timely manner

## Security Considerations

- Manager approval prevents unauthorized escalation of privileges
- Review comments are stored securely with user IDs
- All review actions are tied to specific manager accounts
- Review history is maintained for audit purposes

## Future Enhancements

Potential improvements for the manager system:

- Review activity dashboard and analytics
- Notification system for pending reviews
- Review deadlines and SLA tracking
- Bulk approve/revert functionality
- Review history and audit logs
- Manager performance metrics
- Multi-level approval workflows
