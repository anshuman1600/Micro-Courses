const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

async function createTestCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://thakuranshumansingh945:kMbx52ziiHHksORs@cluster0.bxwaenh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

    // Find a creator user
    const creator = await User.findOne({ role: 'Creator' });
    if (!creator) {
      console.log('No creator user found. Creating one...');
      const newCreator = new User({
        name: 'Test Creator',
        email: 'creator@test.com',
        password: 'creator123',
        role: 'Creator'
      });
      await newCreator.save();
      console.log('Creator created: creator@test.com / creator123');
    }

    const creatorUser = await User.findOne({ role: 'Creator' });

    // Create test courses in different statuses
    const courses = [
      {
        title: 'Introduction to JavaScript',
        description: 'Learn the basics of JavaScript programming',
        price: 29.99,
        creator: creatorUser._id,
        status: 'Draft'
      },
      {
        title: 'React for Beginners',
        description: 'Build modern web applications with React',
        price: 49.99,
        creator: creatorUser._id,
        status: 'Pending Review'
      },
      {
        title: 'Node.js Fundamentals',
        description: 'Server-side JavaScript with Node.js',
        price: 39.99,
        creator: creatorUser._id,
        status: 'Pending Review'
      }
    ];

    for (const courseData of courses) {
      const course = new Course(courseData);
      await course.save();
      console.log(`Created course: ${course.title} (${course.status})`);
    }

    console.log('\nTest courses created successfully!');
    console.log('Admin can now review the "Pending Review" courses at /admin/review/courses');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

createTestCourses();
