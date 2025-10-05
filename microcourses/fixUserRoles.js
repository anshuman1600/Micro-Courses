const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://thakuranshumansingh945:kMbx52ziiHHksORs@cluster0.bxwaenh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function fixUserRoles() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    // Find users with role "Creator" but creatorApplicationStatus not "Approved"
    const usersToFix = await User.find({
      role: 'Creator',
      creatorApplicationStatus: { $ne: 'Approved' }
    });

    console.log(`Found ${usersToFix.length} users to fix`);

    for (const user of usersToFix) {
      console.log(`Fixing user: ${user.name} (${user.email}) - Role: ${user.role}, Status: ${user.creatorApplicationStatus}`);
      user.role = 'Learner';
      await user.save();
      console.log(`Updated user ${user.name} to role: Learner`);
    }

    console.log('User role fix completed');

    // Show all users after fix
    const allUsers = await User.find({}).select('name email role creatorApplicationStatus');
    console.log('\nAll users after fix:');
    allUsers.forEach(user => {
      console.log(`Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Status: ${user.creatorApplicationStatus}`);
    });

  } catch (error) {
    console.error('Error fixing user roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

fixUserRoles();
