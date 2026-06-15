const fs = require('fs');
const filePath = 'C:\\Users\\91993\\.gemini\\antigravity\\brain\\17ad18e6-6ec0-4530-820b-bdbfe966e35f\\.system_generated\\steps\\3497\\content.md';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Search for lines containing phone, api, whatsapp, allow
  const lines = content.split('\n');
  console.log('--- Matching Lines in CallMeBot Page ---');
  
  lines.forEach((line, idx) => {
    if (line.includes('allow') || line.includes('apikey') || line.includes('+34') || line.includes('api.whatsapp.com')) {
      console.log(`Line ${idx + 1}: ${line.trim().slice(0, 150)}`);
    }
  });
  
} catch (err) {
  console.error(err);
}
