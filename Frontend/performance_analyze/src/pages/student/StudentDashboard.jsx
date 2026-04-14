import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import TrendChart from '../../components/charts/TrendChart';
import RecordTable from '../../components/tables/RecordTable';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import RadarChart from '../../components/charts/RadarChart';
import { studentService } from '../../services/studentService';
import { MagneticButton } from '../../components/ui/motionPrimitives';
import TableSkeleton from '../../components/ui/TableSkeleton';

function StudentDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'dashboard';

  const [dashboard, setDashboard] = useState(null);
  const [records, setRecords] = useState([]);

  const chartData = useMemo(() => {
    if (!dashboard?.trend) return [];
    return dashboard.trend.map((item) => ({
      label: new Date(item.date).toLocaleDateString(),
      riskScore: item.riskScore,
      examScore: item.examScore,
    }));
  }, [dashboard]);

  const riskDistribution = useMemo(() => {
    const base = { High: 0, Medium: 0, Low: 0 };
    records.forEach((record) => {
      const level = record?.prediction?.riskLevel || 'Low';
      base[level] += 1;
    });

    return [
      { name: 'High', value: base.High },
      { name: 'Medium', value: base.Medium },
      { name: 'Low', value: base.Low },
    ];
  }, [records]);

  const subjectBars = useMemo(() => {
    const map = new Map();
    records.forEach((record) => {
      const key = record.subject || 'Unknown';
      const existing = map.get(key) || { subject: key, totalExam: 0, count: 0 };
      existing.totalExam += record.examScore;
      existing.count += 1;
      map.set(key, existing);
    });

    return Array.from(map.values()).map((item) => ({
      subject: item.subject,
      examAverage: Number((item.totalExam / item.count).toFixed(2)),
    }));
  }, [records]);

  const latestFactorRadar = useMemo(() => {
    const latest = dashboard?.latestRecord;
    if (!latest) return [];

    return [
      { subject: 'Attendance', score: latest.attendance },
      { subject: 'Assignment', score: latest.assignmentScore },
      { subject: 'Exam', score: latest.examScore },
      { subject: 'Participation', score: latest.participationScore },
      { subject: 'Behavior', score: latest.behaviorScore },
    ];
  }, [dashboard]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const [dashboardRes, recordsRes] = await Promise.all([
        studentService.dashboard(),
        studentService.records(),
      ]);

      if (!isMounted) return;
      setDashboard(dashboardRes.data.data);
      setRecords(recordsRes.data.data.records);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout title="Student Progress Hub">
      {!dashboard ? (
        <div className="center-screen">
          <div style={{ width: '100%', maxWidth: 900 }}>
            <TableSkeleton rows={7} />
          </div>
        </div>
      ) : (
        <>
          <div className="tab-bar" style={{ marginBottom: '1rem' }}>
            {[
              ['dashboard', 'Dashboard'],
              ['progress', 'My Progress'],
              ['study-plan', 'Study Plan'],
            ].map(([key, label]) => (
              <MagneticButton key={key} type="button" className={`tab motion-btn ${currentView === key ? 'active' : ''}`} onClick={() => setSearchParams({ view: key })}>
                {currentView === key && <motion.span layoutId="panel-tab-active" className="tab-active-indicator" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />}
                <span className="tab-label">{label}</span>
              </MagneticButton>
            ))}
          </div>

          <section className="grid-4">
            <StatCard label="Class" value={dashboard.student.className || 'N/A'} accent="blue" />
            <StatCard
              label="Latest Risk Score"
              value={dashboard.latestPrediction ? dashboard.latestPrediction.riskScore.toFixed(1) : 'N/A'}
              accent="amber"
            />
            <StatCard
              label="Risk Level"
              value={dashboard.latestPrediction ? dashboard.latestPrediction.riskLevel : 'N/A'}
              accent="coral"
            />
            <StatCard label="Records" value={records.length} accent="teal" />
          </section>

          {(currentView === 'dashboard' || currentView === 'progress') && (
            <section className="panel-card split-panel">
              <div>
                <h3>Explainable Prediction Insights</h3>
                {dashboard.latestPrediction ? (
                  <>
                    <p>
                      Current risk status:{' '}
                      <Badge variant={(dashboard.latestPrediction.riskLevel || 'low').toLowerCase()}>
                        {dashboard.latestPrediction.riskLevel}
                      </Badge>
                    </p>
                    <ul className="data-list compact">
                      {dashboard.latestPrediction.explainableInsights.map((insight, idx) => (
                        <li key={idx}>{insight}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>No prediction available yet.</p>
                )}
              </div>
              <div>
                <h3>Personalized Interventions</h3>
                {dashboard.latestPrediction ? (
                  <ul className="data-list compact">
                    {dashboard.latestPrediction.interventions.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No recommendations yet.</p>
                )}
              </div>
            </section>
          )}

          {(currentView === 'dashboard' || currentView === 'study-plan') && (
            <section className="panel-card split-panel">
              <div>
                <h3>Smart Attendance Planner</h3>
                {dashboard.latestPrediction?.attendancePlanner ? (
                  <ul className="data-list compact">
                    <li>Current attendance: {dashboard.latestPrediction.attendancePlanner.currentAttendance}%</li>
                    <li>Required additional classes: {dashboard.latestPrediction.attendancePlanner.requiredClasses}</li>
                    <li>Projected attendance: {dashboard.latestPrediction.attendancePlanner.projectedAttendance}%</li>
                    <li>Attend days: {dashboard.latestPrediction.attendancePlanner.attendDays.join(', ') || 'None'}</li>
                    <li>Study-focused skip days: {dashboard.latestPrediction.attendancePlanner.skipDays.join(', ') || 'None'}</li>
                  </ul>
                ) : (
                  <p className="muted-text">Attendance planner data not available yet.</p>
                )}
              </div>

              <div>
                <h3>Target Score Predictor</h3>
                {dashboard.latestPrediction?.targetScorePredictor ? (
                  <ul className="data-list compact">
                    <li>Low target (pass): {dashboard.latestPrediction.targetScorePredictor.low.requiredInFinal} in final</li>
                    <li>Medium target: {dashboard.latestPrediction.targetScorePredictor.medium.requiredInFinal} in final</li>
                    <li>High target: {dashboard.latestPrediction.targetScorePredictor.high.requiredInFinal} in final</li>
                    <li>{dashboard.latestPrediction.targetScorePredictor.recommendation}</li>
                  </ul>
                ) : (
                  <p className="muted-text">Target score prediction unavailable.</p>
                )}
              </div>
            </section>
          )}

          {dashboard.latestPrediction?.examShock?.detected && (
            <section className="panel-card">
              <h3 className="card-title">Exam Shock Alert</h3>
              <p className="error-text">{dashboard.latestPrediction.examShock.explanation}</p>
            </section>
          )}

          {(currentView === 'dashboard' || currentView === 'progress') && (
            <>
              <section className="two-col">
                <Card title="My Risk Distribution">
                  <DonutChart data={riskDistribution} />
                </Card>
                <Card title="Subject-wise Exam Averages">
                  <BarChart data={subjectBars} xKey="subject" dataKey="examAverage" color="#4f46e5" />
                </Card>
              </section>

              <section className="panel-card">
                <h3 className="card-title">Latest Performance Factors</h3>
                {latestFactorRadar.length > 0 ? (
                  <RadarChart data={latestFactorRadar} dataKey="score" nameKey="subject" color="#7c3aed" />
                ) : (
                  <p className="muted-text">No latest factor data available yet.</p>
                )}
              </section>

              <TrendChart data={chartData} title="My Risk & Exam Trend" />
            </>
          )}

          {(currentView === 'progress' || currentView === 'study-plan') && <RecordTable rows={records} />}
        </>
      )}
    </DashboardLayout>
  );
}

export default StudentDashboard;
