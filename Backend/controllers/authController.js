const User = require('../models/User');
const PerformanceRecord = require('../models/PerformanceRecord');
const { generateToken } = require('../utils/token');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { predictRisk } = require('../services/predictionService');

const isBcryptHash = (value = '') => /^\$2[aby]\$\d{2}\$/.test(value);

const upsertDemoUser = async ({ name, email, password, role, className = null, assignedTeacher = null }) => {
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      name,
      email,
      password,
      role,
      className,
      assignedTeacher,
      isActive: true,
    });
  } else {
    user.name = name;
    user.role = role;
    user.className = className;
    user.assignedTeacher = assignedTeacher;
    user.password = password;
    user.isActive = true;
  }

  await user.save();
  return user;
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    let isMatch = false;

    if (isBcryptHash(user.password)) {
      isMatch = await user.matchPassword(password);
    } else if (user.password === password) {
      // Backward compatibility: migrate legacy plain-text passwords to bcrypt on successful login.
      user.password = password;
      await user.save();
      isMatch = true;
    }

    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    return successResponse(res, 'Login successful', {
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        className: user.className,
      },
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    return successResponse(res, 'Profile fetched', { user: req.user });
  } catch (error) {
    next(error);
  }
};

const seedDemoData = async (req, res, next) => {
  try {
    const admin = await upsertDemoUser({
      name: 'System Admin',
      email: 'admin@isp.edu',
      password: 'Admin@123',
      role: 'admin',
    });

    const teacher = await upsertDemoUser({
      name: 'Aarav Sharma',
      email: 'teacher@isp.edu',
      password: 'Teacher@123',
      role: 'teacher',
      className: 'Class-10A',
    });

    const students = [];
    students.push(
      await upsertDemoUser({
        name: 'Riya Verma',
        email: 'riya@student.edu',
        password: 'Student@123',
        role: 'student',
        className: 'Class-10A',
        assignedTeacher: teacher._id,
      })
    );
    students.push(
      await upsertDemoUser({
        name: 'Kabir Mehta',
        email: 'kabir@student.edu',
        password: 'Student@123',
        role: 'student',
        className: 'Class-10A',
        assignedTeacher: teacher._id,
      })
    );
    students.push(
      await upsertDemoUser({
        name: 'Anaya Singh',
        email: 'anaya@student.edu',
        password: 'Student@123',
        role: 'student',
        className: 'Class-10A',
        assignedTeacher: teacher._id,
      })
    );

    const baseRows = [
      {
        subject: 'Mathematics',
        attendance: 91,
        assignmentScore: 82,
        examScore: 86,
        participationScore: 78,
        behaviorScore: 84,
      },
      {
        subject: 'Science',
        attendance: 74,
        assignmentScore: 58,
        examScore: 55,
        participationScore: 52,
        behaviorScore: 66,
      },
      {
        subject: 'English',
        attendance: 68,
        assignmentScore: 62,
        examScore: 49,
        participationScore: 46,
        behaviorScore: 50,
      },
    ];

    const records = [];
    students.forEach((student, idx) => {
      for (let month = 0; month < 5; month += 1) {
        const source = baseRows[(idx + month) % baseRows.length];
        const row = {
          ...source,
          attendance: Math.max(40, Math.min(100, source.attendance + month * 2 - idx * 3)),
          assignmentScore: Math.max(30, Math.min(100, source.assignmentScore + month * 3 - idx * 2)),
          examScore: Math.max(25, Math.min(100, source.examScore + month * 4 - idx * 3)),
          participationScore: Math.max(20, Math.min(100, source.participationScore + month * 2 - idx * 2)),
          behaviorScore: Math.max(25, Math.min(100, source.behaviorScore + month * 2 - idx * 1)),
        };

        const prediction = predictRisk(row);
        records.push({
          ...row,
          student: student._id,
          teacher: teacher._id,
          className: 'Class-10A',
          recordedAt: new Date(2026, month, 10 + idx),
          prediction,
        });
      }
    });

    const existingDemoRecords = await PerformanceRecord.countDocuments({
      teacher: teacher._id,
      className: 'Class-10A',
    });

    if (existingDemoRecords === 0) {
      await PerformanceRecord.insertMany(records);
    }

    return successResponse(res, 'Demo credentials are ready', {
      credentials: {
        admin: { email: 'admin@isp.edu', password: 'Admin@123' },
        teacher: { email: 'teacher@isp.edu', password: 'Teacher@123' },
        student: { email: 'riya@student.edu', password: 'Student@123' },
      },
      created: {
        adminId: admin._id,
        teacherId: teacher._id,
        students: students.length,
        performanceRecords: existingDemoRecords === 0 ? records.length : existingDemoRecords,
      },
    }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  me,
  seedDemoData,
};
