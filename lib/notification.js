const nodemailer = require('nodemailer');
const https = require('https');
const url = require('url');

/**
 * Sends a notification email and WhatsApp alert when a consultation is initiated.
 * Runs asynchronously to prevent blocking the client's request.
 */
async function sendConsultationNotification(conv) {
  // Extract info
  const age = conv.customerAge || 'N/A';
  const gender = conv.customerGender || 'N/A';
  const specialty = conv.preferredSpecialty || 'herbal';
  
  // Resolve agent name
  let agentName = 'Pending Match';
  if (conv.agent) {
    if (typeof conv.agent === 'object') {
      agentName = conv.agent.name || 'Wellness Specialist';
    } else {
      agentName = conv.agent.toString().includes('anil') || conv.agent === '605c72ab1c2d3a0015f623a1'
        ? 'Dr. Anil Singh (Ayurvedic)'
        : 'Dr. Anamika Verma (Gyne)';
    }
  } else {
    // Determine based on preferredGender
    if (conv.preferredGender === 'male') {
      agentName = 'Dr. Anil Singh (Ayurvedic)';
    } else if (conv.preferredGender === 'female') {
      agentName = 'Dr. Anamika Verma (Gyne)';
    }
  }

  const emailSubject = `🌿 New Nexoveda Consultation: ${gender.toUpperCase()}, ${age} years`;
  const emailText = `New Nexoveda Consultation Request:
- Age: ${age}
- Gender: ${gender}
- Specialty: ${specialty}
- Assigned Advisor: ${agentName}
- Status: ${conv.status}
- Room ID: ${conv._id}

Access the staff portal at: https://nexoveda.com/staff`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #10b981;">
        <span style="font-size: 40px;">🌿</span>
        <h2 style="color: #064e3b; margin: 10px 0 0 0;">Nexoveda Consultation Alert</h2>
        <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 5px 0 0 0;">New Request Received</p>
      </div>
      
      <div style="padding: 20px 0;">
        <p style="color: #374151; font-size: 14px;">A customer has initiated a new secure chat consultation. Here are the details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; font-weight: bold; color: #475569; width: 40%; border-bottom: 1px solid #f1f5f9;">Customer Age</td>
            <td style="padding: 10px; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${age} years</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #475569; border-bottom: 1px solid #f1f5f9;">Customer Gender</td>
            <td style="padding: 10px; color: #1e293b; text-transform: capitalize; border-bottom: 1px solid #f1f5f9;">${gender}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; font-weight: bold; color: #475569; border-bottom: 1px solid #f1f5f9;">Preferred Specialty</td>
            <td style="padding: 10px; color: #1e293b; text-transform: capitalize; border-bottom: 1px solid #f1f5f9;">${specialty}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #475569; border-bottom: 1px solid #f1f5f9;">Matched Specialist</td>
            <td style="padding: 10px; color: #064e3b; font-weight: bold; border-bottom: 1px solid #f1f5f9;">${agentName}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; font-weight: bold; color: #475569; border-bottom: 1px solid #f1f5f9;">Lobby Status</td>
            <td style="padding: 10px; color: #1e293b; text-transform: capitalize; border-bottom: 1px solid #f1f5f9;">${conv.status}</td>
          </tr>
        </table>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="https://nexoveda.com/staff" style="background-color: #065f46; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 14px; display: inline-block;">
            Open Staff Portal 🔑
          </a>
        </div>
      </div>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; color: #9ca3af; font-size: 11px;">
        © 2026 Nexoveda Wellness Global. All Rights Reserved.
      </div>
    </div>
  `;

  // 1. Send Email
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass && !smtpUser.includes('ENTER_YOUR') && !smtpPass.includes('ENTER_YOUR')) {
      const transporter = nodemailer.createTransport({
        host: smtpHost || 'smtp.gmail.com',
        port: parseInt(smtpPort),
        secure: smtpPort == 465 || process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"Nexoveda Alerts" <${smtpUser}>`,
        to: 'nexoveda@gmail.com',
        subject: emailSubject,
        text: emailText,
        html: emailHtml
      });
      console.log('✅ Consultation alert email sent successfully to nexoveda@gmail.com');
    } else {
      console.warn('⚠️ SMTP_USER and SMTP_PASS environment variables are not configured in .env. Falling back to FormSubmit.co for zero-config email delivery.');
      
      // Zero-config FormSubmit fallback (No password required, sends email to nexoveda@gmail.com)
      const postData = JSON.stringify({
        _subject: emailSubject,
        Customer_Age: `${age} years`,
        Customer_Gender: gender,
        Preferred_Specialty: specialty,
        Matched_Advisor: agentName,
        Lobby_Status: conv.status,
        Staff_Portal_Link: 'https://nexoveda.com/staff'
      });

      const options = {
        hostname: 'formsubmit.co',
        port: 443,
        path: '/ajax/nexoveda@gmail.com',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Referer': 'https://nexoveda.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          console.log('✅ FormSubmit alert email sent successfully. Response:', body);
        });
      });

      req.on('error', (e) => {
        console.error('❌ FormSubmit delivery failed:', e.message || e);
      });

      req.write(postData);
      req.end();
    }
  } catch (emailErr) {
    console.error('❌ Failed to send alert email:', emailErr.message || emailErr);
  }

  // 2. Send WhatsApp
  const phone = '919250089477';
  const waMessage = `🌿 *Nexoveda New Consultation Alert!*

• *Age:* ${age} years
• *Gender:* ${gender}
• *Specialty:* ${specialty}
• *Specialist:* ${agentName}

🔗 *Staff Portal:* https://nexoveda.com/staff`;

  try {
    const callmebotKey = process.env.CALLMEBOT_API_KEY;
    const waUrl = process.env.WHATSAPP_API_URL;
    const waToken = process.env.WHATSAPP_TOKEN;

    if (callmebotKey && !callmebotKey.includes('ENTER_YOUR')) {
      // Send via CallMeBot (Free WhatsApp API)
      const encodedMsg = encodeURIComponent(waMessage);
      const requestUrl = `https://api.callmebot.com/whatsapp.php?phone=+${phone}&text=${encodedMsg}&apikey=${callmebotKey}`;
      
      https.get(requestUrl, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
          console.log(`✅ WhatsApp alert sent via CallMeBot. Response: ${data.trim()}`);
        });
      }).on('error', (err) => {
        console.error('❌ WhatsApp alert failed via CallMeBot:', err.message);
      });

    } else if (waUrl && waToken) {
      // Send via custom/generic WhatsApp HTTP API
      const payload = JSON.stringify({
        phone: phone,
        message: waMessage,
        token: waToken
      });

      const parsedUrl = url.parse(waUrl);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.path || '/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${waToken}`,
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log(`✅ WhatsApp alert sent via custom API. Status: ${res.statusCode}, Response: ${data}`);
        });
      });

      req.on('error', (err) => {
        console.error('❌ WhatsApp alert failed via custom API:', err.message);
      });

      req.write(payload);
      req.end();

    } else {
      console.warn('⚠️ CALLMEBOT_API_KEY or WHATSAPP_API_URL environment variables are not configured in .env. Skipping WhatsApp alert.');
      console.log('WhatsApp notification that would have been sent:');
      console.log(`To: +${phone}\nMessage:\n${waMessage}`);
    }
  } catch (waErr) {
    console.error('❌ WhatsApp alert sending failed:', waErr.message || waErr);
  }

  // 3. Send Telegram (100% Free and Reliable Backup Notification option)
  try {
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHAT_ID;

    if (tgToken && tgChatId && !tgToken.includes('ENTER_YOUR') && !tgChatId.includes('ENTER_YOUR')) {
      const encodedMsg = encodeURIComponent(waMessage);
      const requestUrl = `https://api.telegram.org/bot${tgToken}/sendMessage?chat_id=${tgChatId}&text=${encodedMsg}&parse_mode=Markdown`;

      https.get(requestUrl, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
          console.log(`✅ Telegram alert sent successfully. Response: ${data.trim()}`);
        });
      }).on('error', (err) => {
        console.error('❌ Telegram alert failed:', err.message);
      });
    }
  } catch (tgErr) {
    console.error('❌ Telegram alert sending failed:', tgErr.message || tgErr);
  }
}

async function sendOtpEmail(email, otp, purpose) {
  try {
    let smtpHost = process.env.SMTP_HOST;
    let smtpPort = process.env.SMTP_PORT || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // Fallback to Gmail defaults if not provided in env but user is using gmail
    if (!smtpHost && smtpUser && smtpUser.includes('@gmail.com')) {
      smtpHost = 'smtp.gmail.com';
      smtpPort = 587;
    }

    if (!smtpUser || !smtpPass || smtpUser.includes('ENTER_YOUR') || smtpPass.includes('ENTER_YOUR')) {
      console.warn('⚠️ SMTP not configured properly, printing OTP to console:', otp);
      throw new Error('Email sending is not configured on the server. Please contact support.');
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort == 465,
      auth: { user: smtpUser, pass: smtpPass }
    });

    const isRegister = purpose === 'register';
    const subject = isRegister ? '🌿 Verify Your Nexoveda Account' : '🌿 Nexoveda Password Reset Code';
    const title = isRegister ? 'Welcome to Nexoveda!' : 'Reset Your Password';
    const messageText = isRegister 
      ? 'Please use the following 6-digit One-Time Password (OTP) to complete your registration.'
      : 'We received a request to reset your password. Use the following 6-digit code to proceed.';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; text-align: center;">
        <span style="font-size: 40px;">🌿</span>
        <h2 style="color: #064e3b; margin: 10px 0 20px 0;">${title}</h2>
        <p style="color: #374151; font-size: 16px;">${messageText}</p>
        <div style="margin: 30px 0;">
          <span style="background-color: #f8fafc; color: #065f46; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; letter-spacing: 4px; border: 2px dashed #10b981;">
            ${otp}
          </span>
        </div>
        <p style="color: #ef4444; font-size: 14px;">This code will expire in 10 minutes. Do not share it with anyone.</p>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; color: #9ca3af; font-size: 11px;">
          © 2026 Nexoveda Wellness Global.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Nexoveda Support" <${smtpUser}>`,
      to: email,
      subject: subject,
      html: html
    });
    console.log(`✅ OTP Email sent to ${email}`);
    return true;
  } catch (err) {
    console.error('❌ Failed to send OTP email:', err.message);
    throw new Error('Failed to send email. Please check SMTP configuration.');
  }
}

module.exports = {
  sendConsultationNotification,
  sendOtpEmail
};
