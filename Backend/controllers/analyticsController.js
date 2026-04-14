const PerformanceRecord = require('../models/PerformanceRecord');
const { successResponse } = require('../utils/apiResponse');

const getClassAnalytics = async (req, res, next) => {
  try {
    const className = req.params.className;
    const records = await PerformanceRecord.find({ className }).populate('student', 'name');

    const byStudent = {};
    records.forEach((record) => {
      const key = String(record.student._id);
      if (!byStudent[key]) {
        byStudent[key] = {
          studentId: record.student._id,
          studentName: record.student.name,
          records: 0,
          averageRiskScore: 0,
          highRiskCount: 0,
        };
      }
      byStudent[key].records += 1;
      byStudent[key].averageRiskScore += record.prediction.riskScore;
      if (record.prediction.riskLevel === 'High') {
        byStudent[key].highRiskCount += 1;
      }
    });

    const studentWise = Object.values(byStudent).map((entry) => ({
      ...entry,
      averageRiskScore: entry.records ? Number((entry.averageRiskScore / entry.records).toFixed(2)) : 0,
    }));

    const trend = await PerformanceRecord.aggregate([
      { $match: { className } },
      {
        $group: {
          _id: {
            year: { $year: '$recordedAt' },
            month: { $month: '$recordedAt' },
          },
          averageRiskScore: { $avg: '$prediction.riskScore' },
          records: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return successResponse(res, 'Class analytics fetched', {
      className,
      records: records.length,
      studentWise,
      trend,
    });
  } catch (error) {
    next(error);
  }
};

const getStudentAnalytics = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    const records = await PerformanceRecord.find({ student: studentId })
      .sort({ recordedAt: 1 })
      .populate('student', 'name className')
      .populate('teacher', 'name');

    const summary = records.reduce(
      (acc, item) => {
        acc.total += 1;
        acc.averageRiskScore += item.prediction.riskScore;
        if (item.prediction.riskLevel === 'High') acc.high += 1;
        if (item.prediction.riskLevel === 'Medium') acc.medium += 1;
        if (item.prediction.riskLevel === 'Low') acc.low += 1;
        return acc;
      },
      { total: 0, averageRiskScore: 0, high: 0, medium: 0, low: 0 }
    );

    summary.averageRiskScore = summary.total ? Number((summary.averageRiskScore / summary.total).toFixed(2)) : 0;

    return successResponse(res, 'Student analytics fetched', {
      student: records[0] ? records[0].student : null,
      summary,
      records,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClassAnalytics,
  getStudentAnalytics,
};
