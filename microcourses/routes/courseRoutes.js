const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Creator only)
router.post('/', protect, authorize('Creator'), async (req, res) => {
  if (req.user.creatorApplicationStatus !== 'Approved') {
    return res.status(403).json({ msg: 'Creator application not approved. Cannot create courses.' });
  }

  const { title, description, price, thumbnail } = req.body;

  try {
    const course = new Course({
      title,
      description,
      creator: req.user.id,
      price,
      thumbnail
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/courses/creator
// @desc    Get all courses created by the logged-in creator
// @access  Private (Creator only)
router.get('/creator', protect, authorize('Creator'), async (req, res) => {
  try {
    const courses = await Course.find({ creator: req.user.id }).populate('creator', 'name email');
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/courses/:id
// @desc    Get a single course by ID
// @access  Private (Creator, Admin, Learner - if published)
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('creator', 'name email');

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Learners can only view published courses
    if (req.user.role === 'Learner' && course.status !== 'Published') {
      return res.status(403).json({ msg: 'Not authorized to view this course' });
    }

    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private (Creator only, must own the course)
router.put('/:id', protect, authorize('Creator'), async (req, res) => {
  const { title, description, price, thumbnail, status } = req.body;

  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Ensure creator owns the course
    if (course.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this course' });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.price = price || course.price;
    course.thumbnail = thumbnail || course.thumbnail;
    course.status = status || course.status; // Creator can update status (e.g., to 'Pending Review')

    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private (Creator only, must own the course)
router.delete('/:id', protect, authorize('Creator'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Ensure creator owns the course
    if (course.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to delete this course' });
    }

    await course.deleteOne();
    res.json({ msg: 'Course removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Lesson Routes for a Course

// @route   POST /api/courses/:courseId/lessons
// @desc    Add a new lesson to a course
// @access  Private (Creator only, must own the course)
router.post('/:courseId/lessons', protect, authorize('Creator'), async (req, res) => {
  const { title, description, videoUrl, order } = req.body;

  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Ensure creator owns the course
    if (course.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to add lessons to this course' });
    }

    // Check for unique order within the course
    const existingLesson = await Lesson.findOne({ course: req.params.courseId, order });
    if (existingLesson) {
      return res.status(400).json({ msg: 'Lesson order must be unique within the course' });
    }

    const lesson = new Lesson({
      title,
      description,
      course: req.params.courseId,
      videoUrl,
      order
    });

    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/courses/:courseId/lessons
// @desc    Get all lessons for a specific course
// @access  Private (Creator, Admin, Learner - if course published)
router.get('/:courseId/lessons', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Learners can only view lessons for published courses
    if (req.user.role === 'Learner' && course.status !== 'Published') {
      return res.status(403).json({ msg: 'Not authorized to view lessons for this course' });
    }

    const lessons = await Lesson.find({ course: req.params.courseId }).sort('order');
    res.json(lessons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/courses/:courseId/lessons/:lessonId
// @desc    Get a single lesson by ID
// @access  Private (Creator, Admin, Learner - if course published)
router.get('/:courseId/lessons/:lessonId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!course || !lesson) {
      return res.status(404).json({ msg: 'Course or Lesson not found' });
    }

    if (lesson.course.toString() !== course.id) {
      return res.status(400).json({ msg: 'Lesson does not belong to this course' });
    }

    // Learners can only view lessons for published courses
    if (req.user.role === 'Learner' && course.status !== 'Published') {
      return res.status(403).json({ msg: 'Not authorized to view this lesson' });
    }

    res.json(lesson);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/courses/:courseId/lessons/:lessonId
// @desc    Update a lesson
// @access  Private (Creator only, must own the course)
router.put('/:courseId/lessons/:lessonId', protect, authorize('Creator'), async (req, res) => {
  const { title, description, videoUrl, order, transcript } = req.body;

  try {
    const course = await Course.findById(req.params.courseId);
    let lesson = await Lesson.findById(req.params.lessonId);

    if (!course || !lesson) {
      return res.status(404).json({ msg: 'Course or Lesson not found' });
    }

    // Ensure creator owns the course
    if (course.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update lessons in this course' });
    }

    if (lesson.course.toString() !== course.id) {
      return res.status(400).json({ msg: 'Lesson does not belong to this course' });
    }

    // Check for unique order if order is being changed
    if (order && order !== lesson.order) {
      const existingLesson = await Lesson.findOne({ course: req.params.courseId, order });
      if (existingLesson) {
        return res.status(400).json({ msg: 'Lesson order must be unique within the course' });
      }
    }

    lesson.title = title || lesson.title;
    lesson.description = description || lesson.description;
    lesson.videoUrl = videoUrl || lesson.videoUrl;
    lesson.order = order || lesson.order;
    lesson.transcript = transcript || lesson.transcript;

    await lesson.save();
    res.json(lesson);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/courses/:courseId/lessons/:lessonId
// @desc    Delete a lesson
// @access  Private (Creator only, must own the course)
router.delete('/:courseId/lessons/:lessonId', protect, authorize('Creator'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!course || !lesson) {
      return res.status(404).json({ msg: 'Course or Lesson not found' });
    }

    // Ensure creator owns the course
    if (course.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to delete lessons from this course' });
    }

    if (lesson.course.toString() !== course.id) {
      return res.status(400).json({ msg: 'Lesson does not belong to this course' });
    }

    await lesson.deleteOne();
    res.json({ msg: 'Lesson removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
