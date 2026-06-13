require('dotenv').config();
const { sendConsultationNotification } = require('../lib/notification');

async function runTest() {
  console.log('--- Testing Consultation Notification ---');
  console.log('Current Env Vars:');
  console.log('SMTP_USER:', process.env.SMTP_USER || '(Not Set)');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***** (Configured)' : '(Not Set)');
  console.log('CALLMEBOT_API_KEY:', process.env.CALLMEBOT_API_KEY ? '***** (Configured)' : '(Not Set)');
  console.log('WHATSAPP_API_URL:', process.env.WHATSAPP_API_URL || '(Not Set)');

  const mockConversation = {
    _id: 'mock_test_room_12345',
    customerAge: 28,
    customerGender: 'male',
    preferredSpecialty: 'herbal',
    preferredGender: 'male',
    agent: null, // Should resolve to Dr. Anil
    status: 'pending'
  };

  console.log('\nTriggering sendConsultationNotification...');
  await sendConsultationNotification(mockConversation);
  console.log('\n--- Notification Trigger Complete ---');
}

runTest().catch(console.error);
