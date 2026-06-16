const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/send-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("STATUS:", res.statusCode);
    console.log("BODY:", data.substring(0, 500));
  });
});

req.on('error', (e) => {
  console.error("Error:", e.message);
});

req.write(JSON.stringify({ email: 'test@example.com', purpose: 'register' }));
req.end();
