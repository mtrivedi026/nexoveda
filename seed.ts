import db from './lib/db.js';
import { seedDatabase } from './lib/seed.js';

async function runSeed() {
  // 1. Connect to DB
  await db.connectDB();

  // 2. Call the seeding function
  await seedDatabase(db);

  // 3. Close the mongoose connection if it was opened
  if (!db.isMock) {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('🔌 Closed MongoDB connection.');
  }
}

runSeed().catch(console.error);
