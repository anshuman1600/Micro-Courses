const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string_here";

async function retrieveAdminUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({ role: 'Admin' }).select('name email');
    if (!adminUser) {
      console.log('No admin user found in the database.');
    } else {
      console.log('Admin user details:');
      console.log(`Name: ${adminUser.name}`);
      console.log(`Email: ${adminUser.email}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error retrieving admin user:', err);
    process.exit(1);
  }
}

retrieveAdminUser();
