const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const clampToNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
};

const normalizeExamScores = (scores = []) => {
  if (!Array.isArray(scores)) return [];
  return scores
    .map((score) => clamp(clampToNumber(score, 0)))
    .filter((score) => Number.isFinite(score));
};

const categorizeStudent = ({ attendance, assignmentScore, examScore }) => {
  const blended = (attendance * 0.25) + (assignmentScore * 0.3) + (examScore * 0.45);

  if (blended >= 75) {
    return {
      category: 'Intelligent',
      suggestedDifficulty: 'Hard',
      reason: 'Consistently strong academic indicators support advanced challenge level.',
    };
  }

  if (blended >= 50) {
    return {
      category: 'Average',
      suggestedDifficulty: 'Medium',
      reason: 'Stable but improvable indicators suggest balanced reinforcement and challenge.',
    };
  }

  return {
    category: 'Low',
    suggestedDifficulty: 'Easy',
    reason: 'Foundational indicators are below benchmark and need structured support.',
  };
};

const detectExamShock = (examScores = []) => {
  if (examScores.length < 3) {
    return {
      detected: false,
      startExamNumber: null,
      explanation: 'At least 3 exams are required for reliable exam-shock detection.',
      dropMagnitude: 0,
    };
  }

  const baselineWindow = 2;
  let foundEvent = null;

  for (let index = baselineWindow; index < examScores.length; index += 1) {
    const baselineScores = examScores.slice(index - baselineWindow, index);
    const baselineAvg = baselineScores.reduce((sum, score) => sum + score, 0) / baselineScores.length;
    const current = examScores[index];
    const dropMagnitude = baselineAvg - current;
    const percentageDrop = baselineAvg > 0 ? (dropMagnitude / baselineAvg) * 100 : 0;

    const sustainedLow = examScores.slice(index).every((score) => score <= baselineAvg - 8);
    const isMajorDrop = dropMagnitude >= 15 || percentageDrop >= 20;

    if (isMajorDrop && sustainedLow) {
      foundEvent = {
        detected: true,
        startExamNumber: index + 1,
        dropMagnitude: Number(dropMagnitude.toFixed(2)),
        explanation: `Performance decline detected after Exam ${index + 1}. Scores dropped from an average of ${baselineAvg.toFixed(
          1
        )} to ${current.toFixed(1)} and remained below baseline.`,
      };
      break;
    }
  }

  if (!foundEvent) {
    return {
      detected: false,
      startExamNumber: null,
      explanation: 'No sustained performance drop event detected across available exam history.',
      dropMagnitude: 0,
    };
  }

  return foundEvent;
};

const buildAttendancePlanner = ({ attendance, totalLectures, daysToExam }) => {
  const safeTotalLectures = Math.max(0, Math.round(clampToNumber(totalLectures, 0)));
  const safeDaysToExam = Math.max(0, Math.round(clampToNumber(daysToExam, 0)));
  const currentAttendance = clamp(clampToNumber(attendance, 0));

  if (safeTotalLectures === 0) {
    return {
      currentAttendance,
      requiredClasses: 0,
      projectedAttendance: currentAttendance,
      attendDays: [],
      skipDays: [],
      recommendation:
        'Lecture planning data is unavailable. Add total lectures and exam timeline for a smart attendance plan.',
    };
  }

  const attendedLectures = Math.round((currentAttendance / 100) * safeTotalLectures);
  const threshold = 75;
  const requiredClasses = Math.max(
    0,
    Math.ceil((0.75 * safeTotalLectures - attendedLectures) / (1 - 0.75))
  );

  const possibleDays = Array.from({ length: safeDaysToExam }, (_, i) => i + 1);
  const attendDays = possibleDays.slice(0, requiredClasses);
  const skipDays = possibleDays.slice(requiredClasses);

  const projectedAttendance = clamp(
    ((attendedLectures + requiredClasses) / (safeTotalLectures + requiredClasses)) * 100
  );

  let recommendation = 'Current attendance is healthy. Continue regular attendance and focused revision.';
  if (requiredClasses > 0 && safeDaysToExam > 0) {
    recommendation = `Attend at least ${requiredClasses} class day(s) before exams to reach ${threshold}%. Reserve remaining day(s) for targeted revision.`;
  } else if (requiredClasses > 0 && safeDaysToExam === 0) {
    recommendation = `Attendance is below ${threshold}%. Attend upcoming classes continuously until threshold is achieved.`;
  }

  return {
    currentAttendance: Number(currentAttendance.toFixed(2)),
    requiredClasses,
    projectedAttendance: Number(projectedAttendance.toFixed(2)),
    attendDays,
    skipDays,
    recommendation,
  };
};

const buildTargetScorePredictor = ({
  internalScore,
  internalMax,
  finalMax,
  passTarget,
  averageTarget,
  highTarget,
}) => {
  const safeInternal = clampToNumber(internalScore, 0);
  const safeInternalMax = Math.max(1, clampToNumber(internalMax, 40));
  const safeFinalMax = Math.max(1, clampToNumber(finalMax, 60));
  const safePassTarget = Math.max(0, clampToNumber(passTarget, 40));
  const safeAverageTarget = Math.max(safePassTarget, clampToNumber(averageTarget, 60));
  const safeHighTarget = Math.max(safeAverageTarget, clampToNumber(highTarget, 80));

  const computeNeeded = (targetTotal) => {
    const needed = targetTotal - safeInternal;
    const clampedNeeded = Math.max(0, Math.min(needed, safeFinalMax));
    const achievable = needed <= safeFinalMax;

    return {
      targetTotal,
      requiredInFinal: Number(clampedNeeded.toFixed(2)),
      achievable,
    };
  };

  const low = computeNeeded(safePassTarget);
  const medium = computeNeeded(safeAverageTarget);
  const high = computeNeeded(safeHighTarget);

  return {
    currentInternalScore: Number(safeInternal.toFixed(2)),
    internalMax: safeInternalMax,
    finalMax: safeFinalMax,
    low,
    medium,
    high,
    recommendation:
      high.achievable
        ? `Aim for ${high.requiredInFinal} in final exam for excellent performance.`
        : medium.achievable
          ? `Excellent target may be difficult. Focus on at least ${medium.requiredInFinal} for solid performance.`
          : `Passing is critical. You need at least ${low.requiredInFinal} in final exam to clear the subject.`,
  };
};

const suggestInterventions = ({ attendance, assignmentScore, examScore, participationScore, behaviorScore }) => {
  const interventions = [];

  if (attendance < 75) interventions.push('Improve attendance through weekly mentor check-ins and parent updates.');
  if (assignmentScore < 60) interventions.push('Use structured assignment planning with teacher-reviewed milestone submissions.');
  if (examScore < 60) interventions.push('Schedule focused remedial sessions and topic-wise mock tests twice per week.');
  if (participationScore < 55) interventions.push('Set classroom participation goals and reward active engagement.');
  if (behaviorScore < 55) interventions.push('Introduce behavior coaching with counselor support and reflection logs.');

  if (interventions.length === 0) {
    interventions.push('Maintain current performance with advanced enrichment and peer mentoring opportunities.');
  }

  return interventions;
};

const buildInsights = ({
  attendance,
  assignmentScore,
  examScore,
  participationScore,
  behaviorScore,
  riskScore,
  category,
  examShock,
  attendancePlanner,
}) => {
  const insights = [];

  insights.push(`Overall risk score computed at ${riskScore.toFixed(1)} on a 0-100 scale.`);

  if (examScore < 60) insights.push('Exam performance is significantly below benchmark and is the strongest risk contributor.');
  if (assignmentScore < 60) insights.push('Assignment consistency indicates learning gaps requiring continuous assessment support.');
  if (attendance < 75) insights.push('Attendance is below healthy threshold, impacting knowledge continuity.');
  if (participationScore < 55) insights.push('Low classroom participation may indicate confidence or comprehension issues.');
  if (behaviorScore < 55) insights.push('Behavior indicators suggest need for closer mentoring and engagement support.');

  insights.push(`Student is currently categorized as ${category}.`);

  if (examShock.detected) {
    insights.push(examShock.explanation);
  }

  if (attendancePlanner.requiredClasses > 0) {
    insights.push(
      `Attendance planner recommends ${attendancePlanner.requiredClasses} additional attended classes to reach 75%.`
    );
  }

  if (insights.length === 1) {
    insights.push('All major indicators are healthy and support strong learning progression.');
  }

  return insights;
};

const predictRisk = (input) => {
  const attendance = clamp(input.attendance);
  const assignmentScore = clamp(input.assignmentScore);
  const examScore = clamp(input.examScore);
  const participationScore = clamp(input.participationScore);
  const behaviorScore = clamp(input.behaviorScore);

  const examScores = normalizeExamScores(input.examScores || [examScore]);

  const categoryDetails = categorizeStudent({
    attendance,
    assignmentScore,
    examScore,
  });

  const examShock = detectExamShock(examScores);
  const attendancePlanner = buildAttendancePlanner({
    attendance,
    totalLectures: input.totalLectures,
    daysToExam: input.daysToExam,
  });
  const targetScorePredictor = buildTargetScorePredictor({
    internalScore: input.internalScore,
    internalMax: input.internalMax,
    finalMax: input.finalMax,
    passTarget: input.passTarget,
    averageTarget: input.averageTarget,
    highTarget: input.highTarget,
  });

  const weightedPerformance =
    (examScore * 0.35) +
    (assignmentScore * 0.25) +
    (attendance * 0.2) +
    (participationScore * 0.1) +
    (behaviorScore * 0.1);

  const riskScore = clamp(100 - weightedPerformance);

  let riskLevel = 'Low';
  if (riskScore >= 65) riskLevel = 'High';
  else if (riskScore >= 35) riskLevel = 'Medium';

  const explainableInsights = buildInsights({
    attendance,
    assignmentScore,
    examScore,
    participationScore,
    behaviorScore,
    riskScore,
    category: categoryDetails.category,
    examShock,
    attendancePlanner,
  });

  const interventions = suggestInterventions({
    attendance,
    assignmentScore,
    examScore,
    participationScore,
    behaviorScore,
  });

  return {
    riskScore,
    riskLevel,
    category: categoryDetails.category,
    suggestedDifficulty: categoryDetails.suggestedDifficulty,
    categorizationReason: categoryDetails.reason,
    examShock,
    attendancePlanner,
    targetScorePredictor,
    explainableInsights,
    interventions,
  };
};

module.exports = { predictRisk };
