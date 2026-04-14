const User = require('../models/User');
const PerformanceRecord = require('../models/PerformanceRecord');
const { predictRisk } = require('../services/predictionService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getTeacherDashboard = async (req, res, next) => {
  try {
    const teacherId = req.user._id;

    const students = await User.find({ role: 'student', assignedTeacher: teacherId, isActive: true }).select('-password');

    const records = await PerformanceRecord.find({ teacher: teacherId })
      .populate('student', 'name email className')
      .sort({ recordedAt: -1 });

    const highRiskStudents = new Set(
      records
        .filter((item) => item?.prediction?.riskLevel === 'High' && item?.student?._id)
        .map((item) => String(item.student._id))
    );

    const classSummary = records.reduce(
      (acc, item) => {
        acc.totalRiskScore += item.prediction.riskScore;
        acc.total += 1;
        if (item.prediction.riskLevel === 'High') acc.high += 1;
        if (item.prediction.riskLevel === 'Medium') acc.medium += 1;
        if (item.prediction.riskLevel === 'Low') acc.low += 1;
        return acc;
      },
      { total: 0, totalRiskScore: 0, high: 0, medium: 0, low: 0 }
    );

    return successResponse(res, 'Teacher dashboard fetched', {
      teacher: {
        id: req.user._id,
        name: req.user.name,
        className: req.user.className,
      },
      kpis: {
        totalStudents: students.length,
        highRiskStudents: highRiskStudents.size,
        averageRiskScore: classSummary.total ? Number((classSummary.totalRiskScore / classSummary.total).toFixed(2)) : 0,
        riskBreakdown: {
          high: classSummary.high,
          medium: classSummary.medium,
          low: classSummary.low,
        },
      },
      students,
      recentRecords: records.slice(0, 15),
    });
  } catch (error) {
    next(error);
  }
};

const getTeacherStudents = async (req, res, next) => {
  try {
    const students = await User.find({
      role: 'student',
      assignedTeacher: req.user._id,
      isActive: true,
    })
      .select('-password')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Teacher students fetched', { students });
  } catch (error) {
    next(error);
  }
};

const getTeacherStudentDetails = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    const student = await User.findOne({
      _id: studentId,
      role: 'student',
      assignedTeacher: req.user._id,
    }).select('-password');

    if (!student) {
      return errorResponse(res, 'Student not found or not assigned to you', 404);
    }

    const records = await PerformanceRecord.find({
      student: studentId,
      teacher: req.user._id,
    }).sort({ recordedAt: 1 });

    return successResponse(res, 'Student details fetched', {
      student,
      records,
    });
  } catch (error) {
    next(error);
  }
};

const addOrUpdatePerformance = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const {
      className,
      subject,
      attendance,
      assignmentScore,
      examScore,
      participationScore,
      behaviorScore,
      examScores,
      totalLectures,
      daysToExam,
      internalScore,
      internalMax,
      finalMax,
      passTarget,
      averageTarget,
      highTarget,
      recordedAt,
    } = req.body;

    const student = await User.findOne({
      _id: studentId,
      role: 'student',
      assignedTeacher: req.user._id,
      isActive: true,
    });

    if (!student) {
      return errorResponse(res, 'Student not found or not assigned to you', 404);
    }

    const prediction = predictRisk({
      attendance,
      assignmentScore,
      examScore,
      participationScore,
      behaviorScore,
      examScores,
      totalLectures,
      daysToExam,
      internalScore,
      internalMax,
      finalMax,
      passTarget,
      averageTarget,
      highTarget,
    });

    const record = await PerformanceRecord.create({
      student: studentId,
      teacher: req.user._id,
      className: className || student.className || req.user.className || 'Unassigned',
      subject,
      attendance,
      assignmentScore,
      examScore,
      participationScore,
      behaviorScore,
      recordedAt: recordedAt || new Date(),
      prediction,
    });

    return successResponse(res, 'Performance record saved with prediction', { record }, 201);
  } catch (error) {
    next(error);
  }
};

const shareFeedback = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const { message, sharedWithStudent = true } = req.body;

    if (!message) {
      return errorResponse(res, 'Feedback message is required', 400);
    }

    const record = await PerformanceRecord.findOne({
      _id: recordId,
      teacher: req.user._id,
    });

    if (!record) {
      return errorResponse(res, 'Record not found', 404);
    }

    record.feedback.push({
      teacher: req.user._id,
      message,
      sharedWithStudent,
    });

    await record.save();

    return successResponse(res, 'Feedback shared successfully', { record });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeacherDashboard,
  getTeacherStudents,
  getTeacherStudentDetails,
  addOrUpdatePerformance,
  shareFeedback,
};
