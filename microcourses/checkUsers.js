const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://thakuranshumansingh945:kMbx52ziiHHksORs@cluster0.bxwaenh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    const users = await User.find({}).select('name email role');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });

    const adminCount = users.filter(user => user.role === 'Admin').length;
    console.log(`\nTotal users: ${users.length}`);
    console.log(`Admin users: ${adminCount}`);

    if (adminCount === 0) {
      console.log('\nNo admin users found. Creating an admin user...');
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@microcourses.com',
        password: 'admin123',
        role: 'Admin'
      });
      await adminUser.save();
      console.log('Admin user created:');
      console.log('Email: admin@microcourses.com');
      console.log('Password: admin123');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkUsers();
