const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string_here";

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    const adminEmail = 'admin@mail.com';
    const adminPassword = 'admin123';

    let adminUser = await User.findOne({ email: adminEmail });
    if (adminUser) {
      console.log('Admin user already exists:', adminUser.email);
    } else {
      adminUser = new User({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'Admin'
      });
      await adminUser.save();
      console.log('Admin user created successfully:', adminUser.email);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

createAdminUser();
