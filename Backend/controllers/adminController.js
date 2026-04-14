const User = require('../models/User');
const PerformanceRecord = require('../models/PerformanceRecord');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getAdminDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalTeachers, totalStudents, totalRecords, highRiskCount] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'teacher', isActive: true }),
      User.countDocuments({ role: 'student', isActive: true }),
      PerformanceRecord.countDocuments(),
      PerformanceRecord.countDocuments({ 'prediction.riskLevel': 'High' }),
    ]);

    const classAggregation = await PerformanceRecord.aggregate([
      {
        $group: {
          _id: '$className',
          averageRiskScore: { $avg: '$prediction.riskScore' },
          records: { $sum: 1 },
        },
      },
      { $sort: { averageRiskScore: -1 } },
    ]);

    return successResponse(res, 'Admin dashboard fetched', {
      kpis: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalRecords,
        highRiskCount,
      },
      classInsights: classAggregation,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const role = req.query.role;
    const filter = role ? { role } : {};

    const users = await User.find(filter)
      .select('-password')
      .populate('assignedTeacher', 'name email')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Users fetched', { users });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, className, assignedTeacher } = req.body;

    if (!name || !email || !password || !role) {
      return errorResponse(res, 'name, email, password and role are required', 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return errorResponse(res, 'User already exists with this email', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      className: className || null,
      assignedTeacher: assignedTeacher || null,
    });

    return successResponse(
      res,
      'User created successfully',
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          className: user.className,
          assignedTeacher: user.assignedTeacher,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      name,
      email,
      role,
      className,
      assignedTeacher,
      isActive,
      password,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (email && email.toLowerCase() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (exists) {
        return errorResponse(res, 'Email already in use', 400);
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (className !== undefined) user.className = className || null;
    if (assignedTeacher !== undefined) user.assignedTeacher = assignedTeacher || null;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (password) user.password = password;

    await user.save();

    const sanitized = await User.findById(userId).select('-password').populate('assignedTeacher', 'name email');

    return successResponse(res, 'User updated successfully', { user: sanitized });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (String(req.user._id) === String(userId)) {
      return errorResponse(res, 'You cannot delete your own account', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    await User.deleteOne({ _id: userId });
    await PerformanceRecord.deleteMany({
      $or: [{ student: userId }, { teacher: userId }],
    });

    return successResponse(res, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
