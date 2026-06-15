const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\91993\\.gemini\\antigravity\\brain\\17ad18e6-6ec0-4530-820b-bdbfe966e35f\\.system_generated\\steps\\3497\\content.md';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find all matches for wa.me or phone numbers
  const wameRegex = /wa\.me\/[0-9+]+/g;
  const phoneRegex = /\+?[0-9]{2,4}\s?[0-9]{3,4}\s?[0-9]{3,4}/g;
  
  const wameMatches = content.match(wameRegex) || [];
  const phoneMatches = content.match(phoneRegex) || [];
  
  console.log('--- wa.me Links Found ---');
  console.log([...new Set(wameMatches)]);
  
  console.log('\n--- Phone Numbers Found ---');
  console.log([...new Set(phoneMatches)].slice(0, 30));
  
} catch (err) {
  console.error('Error reading file:', err);
}
