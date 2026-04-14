const express = require('express');
const { login, me, seedDemoData } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../middleware/asyncHandler');
const { loginValidator } = require('../validators/authValidator');

const router = express.Router();

router.post('/login', validateRequest(loginValidator), asyncHandler(login));
router.get('/me', protect, asyncHandler(me));
router.post('/seed-demo', asyncHandler(seedDemoData));

module.exports = router;
