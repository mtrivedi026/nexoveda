const mongoose = require('mongoose');
require('dotenv').config();

async function updateNames() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.useDb('test'); // Replace with actual db name if different
  const User = db.model('User', new mongoose.Schema({}, {strict: false}));
  
  await User.updateOne({_id: 'agent-harsh'}, {'$set': {name: 'Male Herbal Consultant'}});
  await User.updateOne({_id: 'agent-anamika'}, {'$set': {name: 'Female Herbal Consultant'}});
  await User.updateOne({_id: 'agent-smita'}, {'$set': {name: 'Female Mental Health Support Specialist'}});
  
  console.log('DB Updated Successfully');
  process.exit(0);
}

updateNames().catch(console.error);
