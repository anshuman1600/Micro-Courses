const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string_here";

async function clearCourses() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await Course.deleteMany({});
    console.log(`Deleted ${result.deletedCount} courses.`);

    process.exit(0);
  } catch (err) {
    console.error('Error clearing courses:', err);
    process.exit(1);
  }
}

clearCourses();
