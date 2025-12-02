// Test manager approval workflow
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testManagerApproval() {
  console.log('🧪 Testing Manager Approval Workflow\n');

  try {
    // Step 1: Get all users
    console.log('Step 1: Fetching all users...');
    const usersResponse = await axios.get(`${API_URL}/users`);
    const allUsers = usersResponse.data;
    console.log(`Found ${allUsers.length} users\n`);

    // Step 2: Find managers
    const managers = allUsers.filter(u => u.role === 'manager');
    console.log(`Managers found: ${managers.length}`);
    managers.forEach(m => {
      console.log(`  - ${m.name} (${m.email})`);
      console.log(`    ID: ${m.id}`);
      console.log(`    Approved: ${m.isApproved}`);
      console.log('');
    });

    // Step 3: Find unapproved managers
    const unapproved = managers.filter(m => m.isApproved === false);
    console.log(`Unapproved managers: ${unapproved.length}\n`);

    if (unapproved.length > 0) {
      const manager = unapproved[0];
      console.log(`Approving manager: ${manager.name} (ID: ${manager.id})`);
      
      // Step 4: Approve the manager
      const approveResponse = await axios.put(`${API_URL}/users/${manager.id}/approve`);
      console.log('Approval response:', approveResponse.data);
      console.log('');

      // Step 5: Verify approval
      console.log('Verifying approval...');
      const verifyResponse = await axios.get(`${API_URL}/users`);
      const updatedManagers = verifyResponse.data.filter(u => u.role === 'manager');
      const approvedManager = updatedManagers.find(m => m.id === manager.id);
      
      console.log(`Manager ${approvedManager.name}:`);
      console.log(`  Was approved: ${manager.isApproved}`);
      console.log(`  Now approved: ${approvedManager.isApproved}`);
      console.log('');
      
      if (approvedManager.isApproved === true) {
        console.log('✅ SUCCESS: Manager was approved!');
      } else {
        console.log('❌ FAILED: Manager is still not approved!');
      }
    } else {
      console.log('ℹ️  No unapproved managers to test with.');
      console.log('Create a manager account first to test approval workflow.');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testManagerApproval();
