const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Course = require('../models/Course');
const User = require('../models/User');

// @route   GET /api/admin/review/courses
// @desc    Get all courses pending review
// @access  Private (Admin only)
router.get('/review/courses', protect, authorize('Admin'), async (req, res) => {
  try {
    const courses = await Course.find({ status: 'Pending Review' }).populate('creator', 'name email');
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/courses/:id/status
// @desc    Update course status (Approve/Reject/Publish)
// @access  Private (Admin only)
router.put('/courses/:id/status', protect, authorize('Admin'), async (req, res) => {
  const { status } = req.body;

  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Only allow specific status changes by Admin
    if (!['Published', 'Rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status for admin update' });
    }

    course.status = status;
    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/creators/pending
// @desc    Get all users with pending creator applications
// @access  Private (Admin only)
router.get('/creators/pending', protect, authorize('Admin'), async (req, res) => {
  try {
    const pendingCreators = await User.find({ creatorApplicationStatus: 'Pending' }).select('-password');
    console.log('Pending creators fetched:', pendingCreators);
    res.json(pendingCreators);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/creators/:id/status
// @desc    Approve or reject creator application
// @access  Private (Admin only)
router.put('/creators/:id/status', protect, authorize('Admin'), async (req, res) => {
  const { status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.creatorApplicationStatus = status;

    if (status === 'Approved') {
      user.role = 'Creator';
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
