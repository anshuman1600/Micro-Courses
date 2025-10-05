const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://thakuranshumansingh945:kMbx52ziiHHksORs@cluster0.bxwaenh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function createTestCreator() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    // Create a test creator user with pending application
    const testCreator = new User({
      name: 'Test Creator',
      email: 'creator@test.com',
      password: 'password123',
      role: 'Learner', // Start as Learner
      creatorApplicationStatus: 'Pending'
    });

    await testCreator.save();
    console.log('Test creator user created successfully');

    // Show all users
    const allUsers = await User.find({}).select('name email role creatorApplicationStatus');
    console.log('\nAll users:');
    allUsers.forEach(user => {
      console.log(`Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Status: ${user.creatorApplicationStatus}`);
    });

  } catch (error) {
    console.error('Error creating test creator:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

createTestCreator();
