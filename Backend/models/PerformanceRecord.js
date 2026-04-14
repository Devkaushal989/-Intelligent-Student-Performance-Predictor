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
      category: {
        type: String,
        enum: ['Low', 'Average', 'Intelligent'],
        default: 'Average',
      },
      suggestedDifficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium',
      },
      categorizationReason: {
        type: String,
        default: '',
      },
      examShock: {
        detected: {
          type: Boolean,
          default: false,
        },
        startExamNumber: {
          type: Number,
          default: null,
        },
        explanation: {
          type: String,
          default: '',
        },
        dropMagnitude: {
          type: Number,
          default: 0,
        },
      },
      attendancePlanner: {
        currentAttendance: {
          type: Number,
          default: 0,
        },
        requiredClasses: {
          type: Number,
          default: 0,
        },
        projectedAttendance: {
          type: Number,
          default: 0,
        },
        attendDays: [Number],
        skipDays: [Number],
        recommendation: {
          type: String,
          default: '',
        },
      },
      targetScorePredictor: {
        currentInternalScore: {
          type: Number,
          default: 0,
        },
        internalMax: {
          type: Number,
          default: 40,
        },
        finalMax: {
          type: Number,
          default: 60,
        },
        low: {
          targetTotal: Number,
          requiredInFinal: Number,
          achievable: Boolean,
        },
        medium: {
          targetTotal: Number,
          requiredInFinal: Number,
          achievable: Boolean,
        },
        high: {
          targetTotal: Number,
          requiredInFinal: Number,
          achievable: Boolean,
        },
        recommendation: {
          type: String,
          default: '',
        },
      },
      explainableInsights: [String],
      interventions: [String],
    },
    feedback: [feedbackSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('PerformanceRecord', performanceRecordSchema);
