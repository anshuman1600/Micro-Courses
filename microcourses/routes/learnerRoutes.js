const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const crypto = require('crypto'); // For generating certificate hash

// @route   GET /api/learner/courses
// @desc    Get all published courses for learners
// @access  Private (Learner only)
router.get('/courses', protect, authorize('Learner'), async (req, res) => {
  try {
    const courses = await Course.find({ status: 'Published' }).populate('creator', 'name email');
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/learner/courses/:courseId/enroll
// @desc    Enroll in a course
// @access  Private (Learner only)
router.post('/courses/:courseId/enroll', protect, authorize('Learner'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    let enrollment = await Enrollment.findOne({ user: req.user.id, course: req.params.courseId });

    if (enrollment) {
      return res.status(400).json({ msg: 'Already enrolled in this course' });
    }

    enrollment = new Enrollment({
      user: req.user.id,
      course: req.params.courseId
    });

    await enrollment.save();
    res.status(201).json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/learner/progress
// @desc    Get all enrolled courses with progress
// @access  Private (Learner only)
router.get('/progress', protect, authorize('Learner'), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('course', 'title description thumbnail');
    res.json(enrollments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/learner/courses/:courseId/lessons/:lessonId/complete
// @desc    Mark a lesson as complete and update course progress
// @access  Private (Learner only)
router.put('/courses/:courseId/lessons/:lessonId/complete', protect, authorize('Learner'), async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    const enrollment = await Enrollment.findOne({ user: req.user.id, course: courseId });
    if (!enrollment) {
      return res.status(404).json({ msg: 'Enrollment not found for this course' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.course.toString() !== courseId) {
      return res.status(404).json({ msg: 'Lesson not found in this course' });
    }

    // Add lessonId to completedLessons if not already present
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completedCount = enrollment.completedLessons.length;

    enrollment.progress = Math.floor((completedCount / totalLessons) * 100);

    if (enrollment.progress === 100) {
      enrollment.completedAt = Date.now();
    }

    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/learner/courses/:courseId/certificate
// @desc    Get certificate if course is 100% complete
// @access  Private (Learner only)
router.get('/courses/:courseId/certificate', protect, authorize('Learner'), async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ user: req.user.id, course: req.params.courseId });

    if (!enrollment) {
      return res.status(404).json({ msg: 'Enrollment not found for this course' });
    }

    if (enrollment.progress !== 100) {
      return res.status(400).json({ msg: 'Course not 100% complete, certificate not available' });
    }

    if (!enrollment.certificateIssued) {
      // Generate unique hash for the certificate
      const certificateHash = crypto.randomBytes(20).toString('hex');
      enrollment.certificateHash = certificateHash;
      enrollment.certificateIssued = true;
      enrollment.completedAt = Date.now();
      await enrollment.save();
    }

    res.json({
      msg: 'Certificate issued',
      certificateHash: enrollment.certificateHash,
      completedAt: enrollment.completedAt
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
