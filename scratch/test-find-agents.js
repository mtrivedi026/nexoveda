const db = require('../lib/db');

async function test() {
  try {
    await db.connectDB();
    const allUsers = await db.User.find({});
    console.log('All Users in DB count:', allUsers.length);
    console.log('Users detail:', allUsers.map(u => ({ name: u.name, email: u.email, role: u.role, gender: u.gender, specialty: u.specialty })));

    const maleQuery = {
      role: 'agent',
      email: { $in: ['anamika@nexoveda.com', 'anil@nexoveda.com'] },
      gender: 'male'
    };
    const maleAgents = await db.User.find(maleQuery);
    console.log('Male agents found:', maleAgents.length, maleAgents.map(a => a.name));

    const femaleQuery = {
      role: 'agent',
      email: { $in: ['anamika@nexoveda.com', 'anil@nexoveda.com'] },
      gender: 'female'
    };
    const femaleAgents = await db.User.find(femaleQuery);
    console.log('Female agents found:', femaleAgents.length, femaleAgents.map(a => a.name));
  } catch (err) {
    console.error('Test failed:', err);
  }
  process.exit(0);
}

test();
