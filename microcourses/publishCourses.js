const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

async function publishCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://thakuranshumansingh945:kMbx52ziiHHksORs@cluster0.bxwaenh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

    // Update all courses to 'Published' status
    const result = await Course.updateMany(
      { status: { $ne: 'Published' } }, // All courses that are not already published
      { status: 'Published' }
    );

    console.log(`Updated ${result.modifiedCount} courses to 'Published' status`);

    // Show all courses after update
    const courses = await Course.find({}).populate('creator', 'name email role');
    console.log('\nAll courses in database:');
    courses.forEach(course => {
      console.log(`ID: ${course._id}, Title: ${course.title}, Status: ${course.status}, Creator: ${course.creator?.name || 'Unknown'} (${course.creator?.role || 'Unknown'})`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

publishCourses();
