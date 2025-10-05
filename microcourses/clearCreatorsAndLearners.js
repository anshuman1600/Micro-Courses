const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string_here";

async function clearCreatorsAndLearners() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await User.deleteMany({ role: { $in: ['Learner', 'Creator'] } });
    console.log(`Deleted ${result.deletedCount} users with role Learner or Creator.`);

    process.exit(0);
  } catch (err) {
    console.error('Error clearing users:', err);
    process.exit(1);
  }
}

clearCreatorsAndLearners();
