const express = require('express');
const { getStudentDashboard, getStudentRecords } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.use(protect, authorize('student'));

router.get('/dashboard', asyncHandler(getStudentDashboard));
router.get('/records', asyncHandler(getStudentRecords));

module.exports = router;
