const mongoose = require('mongoose');
const User = require('./microcourses/models/User');

const MONGO_URI = "mongodb+srv://thakuranshumansingh945:kMbx52ziiHHksORs@cluster0.bxwaenh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function approveCreator(email) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      await mongoose.disconnect();
      process.exit(1);
    }

    user.creatorApplicationStatus = 'Approved';
    user.role = 'Creator';

    await user.save();
    console.log(`User ${email} approved as Creator`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Replace with the creator's email to approve
const creatorEmail = 'creator@test.com';

approveCreator(creatorEmail);
