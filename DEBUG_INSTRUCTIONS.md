# Debug Instructions for Manager Approval Issue

## Quick Fix - Test in Browser Console

1. **Open your browser console** (Press F12, then go to Console tab)

2. **Check what's in localStorage:**

```javascript
// See all users
JSON.parse(localStorage.getItem("nebulaUsers"));

// See current logged-in user
JSON.parse(localStorage.getItem("nebulaUser"));
```

3. **Add a test manager manually:**

```javascript
const users = JSON.parse(localStorage.getItem("nebulaUsers") || "[]");
users.push({
  id: "test-manager-" + Date.now(),
  name: "Test Manager",
  email: "manager@test.com",
  password: "test123",
  role: "manager",
  isApproved: false,
});
localStorage.setItem("nebulaUsers", JSON.stringify(users));
alert("Test manager added! Now refresh the admin dashboard.");
```

4. **Refresh the page** - The pending manager should now appear in the admin dashboard

## Step-by-Step Debugging

### Step 1: Create Manager Account

1. Logout if you're logged in
2. Click "New to Nebula? Create account"
3. Fill in the form
4. **Important**: Select "Nebula Manager (Requires Admin Approval)" from the dropdown
5. Click "Join Nebula"
6. You should see: "Manager account created! Waiting for admin approval."

### Step 2: Check Console Logs

In the browser console, you should see:

```
Created new user: {role: 'manager', isApproved: false, ...}
All users after creation: [...]
Saved to localStorage: [...]
```

### Step 3: Login as Admin

1. Email: `admin@nebula.com`
2. Password: `admin123`
3. Click "Enter Nebula"

### Step 4: Check Dashboard

In the browser console, you should see:

```
Dashboard - User data: {role: 'admin', ...}
Dashboard - isAdmin: true isManager: false
PendingManagers component mounted
Loading pending managers, localStorage data: [...]
All users: [...]
Filtered pending managers: [...]
```

### Step 5: Verify Component is Rendering

Look for the "Pending Manager Approvals" card on the dashboard. It should be visible only to admins.

## Common Issues and Solutions

### Issue 1: "No pending manager requests" showing even though you created one

**Diagnosis:**

```javascript
// Check if manager was actually created
const users = JSON.parse(localStorage.getItem("nebulaUsers"));
const managers = users.filter((u) => u.role === "manager");
console.log("Managers:", managers);
```

**Solution:**

- If no managers found: The signup didn't save properly. Try creating again.
- If manager has `isApproved: true`: Change it to `false`
  ```javascript
  const users = JSON.parse(localStorage.getItem("nebulaUsers"));
  users.forEach((u) => {
    if (u.role === "manager") u.isApproved = false;
  });
  localStorage.setItem("nebulaUsers", JSON.stringify(users));
  location.reload();
  ```

### Issue 2: Component not showing at all

**Diagnosis:**

```javascript
// Check if you're actually admin
const currentUser = JSON.parse(localStorage.getItem("nebulaUser"));
console.log("Current user role:", currentUser?.role);
```

**Solution:**

- If not admin, login as admin (admin@nebula.com / admin123)

### Issue 3: Manager can login even though not approved

**Solution:** The login check is now fixed. Try logging in as the pending manager - you should see: "Your manager account is pending admin approval"

## Reset Everything

If nothing works, reset to a clean state:

```javascript
// Clear everything
localStorage.clear();

// Set up default users
localStorage.setItem(
  "nebulaUsers",
  JSON.stringify([
    {
      id: "1",
      email: "admin@nebula.com",
      password: "admin123",
      role: "admin",
      name: "Admin User",
      isApproved: true,
    },
    {
      id: "2",
      email: "user@nebula.com",
      password: "user123",
      role: "user",
      name: "Regular User",
      isApproved: true,
    },
    {
      id: "3",
      email: "manager@test.com",
      password: "manager123",
      role: "manager",
      name: "Test Manager",
      isApproved: false,
    },
  ])
);

alert("Reset complete! Refresh and login as admin.");
location.reload();
```

## Using Test Utils

Load the test utilities by pasting the contents of `frontend/public/test-utils.js` into the browser console, then use:

```javascript
// Add a test manager
testUtils.addTestManager();

// Check for pending managers
testUtils.checkPendingManagers();

// Approve a manager
testUtils.approveManager("manager@test.com");

// See current user
testUtils.checkCurrentUser();

// Reset to defaults
testUtils.resetUsers();
```

## Expected Flow

### Manager Signup:

1. User selects "Manager" role ✓
2. Form creates user with `isApproved: false` ✓
3. User saved to localStorage ✓
4. Success message shown ✓
5. Cannot login (gets error) ✓

### Admin Approval:

1. Admin logs in ✓
2. Dashboard shows isAdmin: true ✓
3. PendingManagers component renders ✓
4. Component loads users from localStorage ✓
5. Filters for `role === 'manager' && isApproved === false` ✓
6. Displays pending managers ✓
7. Admin clicks "Approve" ✓
8. Updates `isApproved: true` ✓
9. Manager disappears from list ✓

### Manager Login:

1. Manager attempts login ✓
2. System checks `isApproved === true` ✓
3. If approved: Login succeeds ✓
4. If not approved: Error shown ✓

## Console Logs to Watch For

When everything is working, you'll see:

**On Manager Signup:**

```
Created new user: {id: "...", role: "manager", isApproved: false, ...}
All users after creation: [{...}, {...}, {role: "manager", isApproved: false}]
Saved to localStorage: [...]
```

**On Admin Dashboard:**

```
Dashboard - User data: {id: "1", role: "admin", ...}
Dashboard - isAdmin: true isManager: false
PendingManagers component mounted
Loading pending managers, localStorage data: [...]
All users: [{...}, {...}, {...}]
User Admin User: role=admin, isApproved=true, isManager=false, notApproved=false
User Regular User: role=user, isApproved=true, isManager=false, notApproved=false
User Test Manager: role=manager, isApproved=false, isManager=true, notApproved=true
Filtered pending managers: [{id: "...", name: "Test Manager", role: "manager", isApproved: false}]
```

**Every 2 seconds (auto-refresh):**

```
Loading pending managers, localStorage data: [...]
(same output as above)
```

## Still Not Working?

Share these console logs:

1. Output after creating manager account
2. Output when viewing admin dashboard
3. Result of: `JSON.parse(localStorage.getItem('nebulaUsers'))`
4. Result of: `JSON.parse(localStorage.getItem('nebulaUser'))`
