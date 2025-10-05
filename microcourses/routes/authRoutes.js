const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
require('dotenv').config(); // load .env

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role: role || 'Learner'
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const secret = process.env.JWT_SECRET || "defaultSecretKey";

    jwt.sign(payload, secret, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          creatorApplicationStatus: user.creatorApplicationStatus ? user.creatorApplicationStatus : 'None'
        }
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
    console.log(`Login failed: User not found for email ${email}`);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
    console.log(`Login failed: Password mismatch for user ${email}`);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log(`Login success for user ${email} with role ${user.role} and creatorApplicationStatus ${user.creatorApplicationStatus}`);

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const secret = process.env.JWT_SECRET || "defaultSecretKey";

    jwt.sign(payload, secret, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          creatorApplicationStatus: user.creatorApplicationStatus || 'None'
        }
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/creator-apply
// @desc    Submit creator application
// @access  Private (Authenticated users)
router.post('/creator-apply', protect, async (req, res) => {
  const { experience, motivation, portfolio } = req.body;

  if (!experience || !motivation) {
    return res.status(400).json({ msg: 'Please provide experience and motivation' });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.creatorApplicationStatus === 'Pending') {
      return res.status(400).json({ msg: 'Application already pending' });
    }

    if (user.role === 'Creator' && user.creatorApplicationStatus === 'Approved') {
      return res.status(400).json({ msg: 'You are already a creator' });
    }

    // If user is not a creator or creatorApplicationStatus is not approved, allow application
    user.role = 'Creator';
    user.creatorApplicationStatus = 'Pending';
    user.experience = experience;
    user.motivation = motivation;
    user.portfolio = portfolio;

    await user.save();

    res.json({ msg: 'Creator application submitted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user info
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
