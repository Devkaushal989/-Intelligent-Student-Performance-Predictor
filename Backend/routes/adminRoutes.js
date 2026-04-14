const express = require('express');
const {
  getAdminDashboard,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../middleware/asyncHandler');
const { userCreateValidator, userUpdateValidator } = require('../validators/adminValidator');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', asyncHandler(getAdminDashboard));
router.get('/users', asyncHandler(getUsers));
router.post('/users', validateRequest(userCreateValidator), asyncHandler(createUser));
router.put('/users/:userId', validateRequest(userUpdateValidator), asyncHandler(updateUser));
router.delete('/users/:userId', asyncHandler(deleteUser));

module.exports = router;
