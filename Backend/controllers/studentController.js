const PerformanceRecord = require('../models/PerformanceRecord');
const { successResponse } = require('../utils/apiResponse');

const getStudentDashboard = async (req, res, next) => {
  try {
    const records = await PerformanceRecord.find({ student: req.user._id })
      .sort({ recordedAt: 1 })
      .populate('teacher', 'name email');

    const latest = records[records.length - 1] || null;

    const trend = records.map((item) => ({
      date: item.recordedAt,
      subject: item.subject,
      riskScore: item.prediction.riskScore,
      riskLevel: item.prediction.riskLevel,
      examScore: item.examScore,
      assignmentScore: item.assignmentScore,
      attendance: item.attendance,
    }));

    return successResponse(res, 'Student dashboard fetched', {
      student: {
        id: req.user._id,
        name: req.user.name,
        className: req.user.className,
      },
      latestPrediction: latest ? latest.prediction : null,
      latestRecord: latest,
      trend,
    });
  } catch (error) {
    next(error);
  }
};

const getStudentRecords = async (req, res, next) => {
  try {
    const records = await PerformanceRecord.find({ student: req.user._id })
      .sort({ recordedAt: -1 })
      .populate('teacher', 'name email')
      .select('-__v');

    const filtered = records.map((item) => ({
      ...item.toObject(),
      feedback: item.feedback.filter((f) => f.sharedWithStudent),
    }));

    return successResponse(res, 'Student records fetched', { records: filtered });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentDashboard,
  getStudentRecords,
};
