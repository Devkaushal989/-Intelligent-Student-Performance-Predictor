const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sharedWithStudent: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const performanceRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    attendance: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    assignmentScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    examScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    participationScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    behaviorScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
    prediction: {
      riskScore: {
        type: Number,
        default: 0,
      },
      riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low',
      },
      explainableInsights: [String],
      interventions: [String],
    },
    feedback: [feedbackSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('PerformanceRecord', performanceRecordSchema);
