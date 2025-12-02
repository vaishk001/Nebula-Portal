/**
 * Test Utilities for Manager Feature
 * 
 * Run these commands in the browser console to test the manager approval flow
 */

// 1. Check current localStorage state
console.log('=== Current Users ===');
console.log(JSON.parse(localStorage.getItem('nebulaUsers') || '[]'));

// 2. Add a test manager (run this to create a test manager)
function addTestManager() {
  const users = JSON.parse(localStorage.getItem('nebulaUsers') || '[]');
  const testManager = {
    id: 'manager-' + Date.now(),
    name: 'Test Manager',
    email: 'testmanager@test.com',
    password: 'test123',
    role: 'manager',
    isApproved: false
  };
  users.push(testManager);
  localStorage.setItem('nebulaUsers', JSON.stringify(users));
  console.log('✅ Test manager added:', testManager);
  console.log('Refresh the admin dashboard to see the pending request');
  return testManager;
}

// 3. Check for pending managers
function checkPendingManagers() {
  const users = JSON.parse(localStorage.getItem('nebulaUsers') || '[]');
  const pending = users.filter(u => u.role === 'manager' && u.isApproved === false);
  console.log('=== Pending Managers ===');
  console.log(pending);
  if (pending.length === 0) {
    console.log('No pending managers found');
  }
  return pending;
}

// 4. Approve a manager by email
function approveManager(email) {
  const users = JSON.parse(localStorage.getItem('nebulaUsers') || '[]');
  const updatedUsers = users.map(u => {
    if (u.email === email && u.role === 'manager') {
      return { ...u, isApproved: true };
    }
    return u;
  });
  localStorage.setItem('nebulaUsers', JSON.stringify(updatedUsers));
  console.log(`✅ Manager ${email} approved`);
  console.log('Manager can now login');
}

// 5. Reset to default users
function resetUsers() {
  const defaultUsers = [
    { id: '1', email: 'admin@nebula.com', password: 'admin123', role: 'admin', name: 'Admin User', isApproved: true },
    { id: '2', email: 'user@nebula.com', password: 'user123', role: 'user', name: 'Regular User', isApproved: true }
  ];
  localStorage.setItem('nebulaUsers', JSON.stringify(defaultUsers));
  console.log('✅ Users reset to defaults');
  console.log(defaultUsers);
}

// 6. Check current logged in user
function checkCurrentUser() {
  const user = JSON.parse(localStorage.getItem('nebulaUser') || 'null');
  console.log('=== Current Logged In User ===');
  console.log(user);
  return user;
}

// Export functions to window for easy access
window.testUtils = {
  addTestManager,
  checkPendingManagers,
  approveManager,
  resetUsers,
  checkCurrentUser
};

console.log(`
📋 Test Utilities Loaded!

Available commands:
- testUtils.addTestManager()          // Add a test manager
- testUtils.checkPendingManagers()    // See pending managers
- testUtils.approveManager(email)     // Approve a manager
- testUtils.resetUsers()              // Reset to default users
- testUtils.checkCurrentUser()        // See who's logged in

Quick Test:
1. testUtils.addTestManager()
2. Refresh admin dashboard
3. You should see pending manager
`);
