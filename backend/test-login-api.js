/**
 * Test login API endpoint with hashed passwords
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testLogin() {
  console.log('🧪 Testing Login API with Hashed Passwords\n');
  console.log('='.repeat(60));
  
  const tests = [
    { email: 'admin@nebula.com', password: 'admin123', shouldPass: true },
    { email: 'user@nebula.com', password: 'user123', shouldPass: true },
    { email: 'admin@nebula.com', password: 'wrongpassword', shouldPass: false },
    { email: 'nonexistent@test.com', password: 'test123', shouldPass: false }
  ];
  
  for (const test of tests) {
    console.log(`\n🔐 Testing: ${test.email} / ${test.password}`);
    console.log(`   Expected: ${test.shouldPass ? 'SUCCESS' : 'FAILURE'}`);
    
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: test.email,
        password: test.password
      });
      
      if (test.shouldPass) {
        console.log(`   ✅ PASSED - Login successful`);
        console.log(`   User: ${response.data.user.name} (${response.data.user.role})`);
        console.log(`   Password field in response: ${response.data.user.password ? 'EXPOSED ❌' : 'HIDDEN ✅'}`);
      } else {
        console.log(`   ❌ FAILED - Should have been rejected but succeeded`);
      }
    } catch (error) {
      if (!test.shouldPass) {
        console.log(`   ✅ PASSED - Login correctly rejected`);
        console.log(`   Error: ${error.response?.data?.error || error.message}`);
      } else {
        console.log(`   ❌ FAILED - Should have succeeded but was rejected`);
        console.log(`   Error: ${error.response?.data?.error || error.message}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Login API Test Complete!\n');
}

// Run the test
testLogin().catch(console.error);
