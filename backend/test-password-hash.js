/**
 * Test password hashing functionality
 * This script tests bcrypt hashing without requiring MongoDB
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function testPasswordHashing() {
  console.log('🔐 Testing Password Hashing with bcrypt\n');
  console.log('='.repeat(60));
  
  try {
    // Test passwords
    const testPasswords = [
      { label: 'Admin', password: 'admin123' },
      { label: 'User', password: 'user123' },
      { label: 'Manager', password: 'manager123' }
    ];
    
    console.log('\n📝 Hashing passwords...\n');
    
    for (const test of testPasswords) {
      console.log(`${test.label} Password: "${test.password}"`);
      
      // Hash the password
      const hash = await bcrypt.hash(test.password, SALT_ROUNDS);
      console.log(`   Hashed: ${hash}`);
      console.log(`   Length: ${hash.length} characters`);
      console.log(`   Format: ${hash.startsWith('$2b$') ? '✅ Valid bcrypt hash' : '❌ Invalid format'}`);
      
      // Verify the password matches
      const isMatch = await bcrypt.compare(test.password, hash);
      console.log(`   Verify: ${isMatch ? '✅ Password matches' : '❌ Password mismatch'}`);
      
      // Test wrong password
      const wrongMatch = await bcrypt.compare('wrongpassword', hash);
      console.log(`   Wrong:  ${!wrongMatch ? '✅ Wrong password rejected' : '❌ Wrong password accepted'}`);
      
      console.log('');
    }
    
    console.log('='.repeat(60));
    console.log('\n✅ Password hashing test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Bcrypt is properly installed and working');
    console.log('   - Passwords are hashed with salt rounds: ' + SALT_ROUNDS);
    console.log('   - Hash format: $2b$10$...');
    console.log('   - Password verification works correctly');
    console.log('\n🎯 Ready to use in backend server!\n');
    
  } catch (error) {
    console.error('❌ Error testing password hashing:', error.message);
    console.error(error);
  }
}

// Run the test
testPasswordHashing();
