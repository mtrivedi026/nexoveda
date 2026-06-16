const bcrypt = require('bcryptjs');

const hash = '$2b$10$gJAo3x5pVsHsJV7WZd4lr.kjq7Pd/xv8vxmjYNPzjig3rH/gEoY8e';

// Array of common passwords to test against the hash
const passwordsToTest = ['password', 'password123', 'admin', 'admin123', 'nexoveda', 'nexoveda123', '123456', '12345678'];

passwordsToTest.forEach(async (pass) => {
  const isMatch = await bcrypt.compare(pass, hash);
  if (isMatch) {
    console.log(`MATCH FOUND! The password is: ${pass}`);
  }
});
