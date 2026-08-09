// Generate Authentic BCrypt Hashes
const crypto = require('crypto');

function hashPassword(password) {
  // We can test using standard BCrypt or check Spring Security password encoder
  console.log(`Password: ${password}`);
}

console.log('Generating hashes...');
