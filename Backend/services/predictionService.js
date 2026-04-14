const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

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

const buildInsights = ({ attendance, assignmentScore, examScore, participationScore, behaviorScore, riskScore }) => {
  const insights = [];

  insights.push(`Overall risk score computed at ${riskScore.toFixed(1)} on a 0-100 scale.`);

  if (examScore < 60) insights.push('Exam performance is significantly below benchmark and is the strongest risk contributor.');
  if (assignmentScore < 60) insights.push('Assignment consistency indicates learning gaps requiring continuous assessment support.');
  if (attendance < 75) insights.push('Attendance is below healthy threshold, impacting knowledge continuity.');
  if (participationScore < 55) insights.push('Low classroom participation may indicate confidence or comprehension issues.');
  if (behaviorScore < 55) insights.push('Behavior indicators suggest need for closer mentoring and engagement support.');

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
    explainableInsights,
    interventions,
  };
};

module.exports = { predictRisk };
