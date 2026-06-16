const db = require('./lib/db');
db.connectDB().then(async () => {
  try {
    const { Message } = db;
    const msg = await Message.create({
      conversation: '64a0f4b3c3b4e5b6d7e8f9a0', // fake id
      sender: 'test',
      senderName: 'Test',
      text: 'hello test',
    });
    console.log("Created Message:", JSON.stringify(msg));
  } catch(e) {
    console.error("Error creating message:", e);
  }
  process.exit(0);
});
