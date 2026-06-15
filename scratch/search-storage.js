const fs = require('fs');
const content = fs.readFileSync('app/components/ChatWidget.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('localStorage') || line.includes('storage')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
