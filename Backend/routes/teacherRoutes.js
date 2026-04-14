const express = require('express');
const {
  getTeacherDashboard,
  getTeacherStudents,
  getTeacherStudentDetails,
  addOrUpdatePerformance,
  shareFeedback,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.use(protect, authorize('teacher'));

router.get('/dashboard', asyncHandler(getTeacherDashboard));
router.get('/students', asyncHandler(getTeacherStudents));
router.get('/students/:studentId', asyncHandler(getTeacherStudentDetails));
router.post('/students/:studentId/records', asyncHandler(addOrUpdatePerformance));
router.post('/records/:recordId/feedback', asyncHandler(shareFeedback));

module.exports = router;
