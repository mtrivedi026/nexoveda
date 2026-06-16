const db = require('./lib/db');
db.connectDB().then(async () => {
  const { Message } = db;
  const msgs = await Message.find({});
  if (msgs.length > 0) {
    console.log("Raw doc 0 text:", msgs[msgs.length-1]?.text);
    console.log("JSON doc 0:", JSON.stringify(msgs[msgs.length-1]));
  } else {
    console.log("No messages");
  }
  process.exit(0);
});
