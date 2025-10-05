const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Lesson = require('./models/Lesson');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string_here";

async function clearDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete all users except admins
    const userResult = await User.deleteMany({ role: { $ne: 'Admin' } });
    console.log(`Deleted ${userResult.deletedCount} users (excluding admins).`);

    // Delete all courses
    const courseResult = await Course.deleteMany({});
    console.log(`Deleted ${courseResult.deletedCount} courses.`);

    // Delete all enrollments
    const enrollmentResult = await Enrollment.deleteMany({});
    console.log(`Deleted ${enrollmentResult.deletedCount} enrollments.`);

    // Delete all lessons
    const lessonResult = await Lesson.deleteMany({});
    console.log(`Deleted ${lessonResult.deletedCount} lessons.`);

    process.exit(0);
  } catch (err) {
    console.error('Error clearing database:', err);
    process.exit(1);
  }
}

clearDatabase();
