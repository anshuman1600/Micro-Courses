require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Set JWT secret if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'microcourses_jwt_secret_key_2024_very_long_and_secure_random_string';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://thakuranshumansingh945:kMbx52ziiHHksORs@cluster0.bxwaenh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
console.log('Connecting to MongoDB...');
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/learner', require('./routes/learnerRoutes'));
app.use('/api/transcripts', require('./routes/transcriptRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('MicroCourses API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
