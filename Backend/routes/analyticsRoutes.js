const express = require('express');
const { getClassAnalytics, getStudentAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/class/:className', protect, authorize('admin', 'teacher'), asyncHandler(getClassAnalytics));
router.get('/student/:studentId', protect, authorize('admin', 'teacher'), asyncHandler(getStudentAnalytics));

module.exports = router;
