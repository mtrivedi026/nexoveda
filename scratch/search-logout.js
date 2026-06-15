const fs = require('fs');
const path = require('path');

const files = [
  'app/admin/page.tsx',
  'app/agent/page.tsx',
  'app/agent/anil/page.tsx',
  'app/agent/anamika/page.tsx',
  'app/components/Navbar.tsx'
];

files.forEach(f => {
  const fullPath = path.join(process.cwd(), f);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('logout') || line.includes('Logout')) {
        console.log(`${f} (line ${idx + 1}): ${line.trim()}`);
      }
    });
  }
});
