require('dotenv').config();
const { sendOtpEmail } = require('./lib/notification');

async function test() {
  console.log("Testing SMTP Settings:", process.env.SMTP_HOST, process.env.SMTP_USER);
  try {
    await sendOtpEmail('mtrivedi026@gmail.com', '123456', 'register');
    console.log("Function executed.");
  } catch(e) {
    console.error("Test Error:", e);
  }
}
test();
