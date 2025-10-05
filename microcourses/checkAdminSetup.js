const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

async function checkAdminSetup() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://thakuranshumansingh945:kMbx52ziiHHksORs@cluster0.bxwaenh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

    // Check admin users
    const adminUsers = await User.find({ role: 'Admin' });
    console.log('Admin users:');
    adminUsers.forEach(user => {
      console.log(`- Name: ${user.name}, Email: ${user.email}`);
    });

    if (adminUsers.length === 0) {
      console.log('No admin users found. Creating admin user...');
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@microcourses.com',
        password: 'admin123',
        role: 'Admin'
      });
      await adminUser.save();
      console.log('Admin user created successfully!');
      console.log('Email: admin@microcourses.com');
      console.log('Password: admin123');
    }

    // Check courses and their statuses
    const courses = await Course.find({}).populate('creator', 'name email');
    console.log('\nCourses in database:');
    courses.forEach(course => {
      console.log(`- Title: ${course.title}, Status: ${course.status}, Creator: ${course.creator?.name || 'Unknown'}`);
    });

    const pendingCourses = courses.filter(course => course.status === 'Pending Review');
    console.log(`\nCourses pending review: ${pendingCourses.length}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkAdminSetup();
