import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import TrendChart from '../../components/charts/TrendChart';
import RecordTable from '../../components/tables/RecordTable';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import RadarChart from '../../components/charts/RadarChart';
import { teacherService } from '../../services/teacherService';

const initialRecord = {
  subject: 'Mathematics',
  attendance: 80,
  assignmentScore: 70,
  examScore: 70,
  participationScore: 70,
  behaviorScore: 75,
  examScores: '80,85,50',
  totalLectures: 40,
  daysToExam: 10,
  internalScore: 38,
  internalMax: 40,
  finalMax: 60,
  passTarget: 40,
  averageTarget: 60,
  highTarget: 80,
};

function TeacherDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'overview';

  const [dashboard, setDashboard] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentDetail, setStudentDetail] = useState(null);
  const [recordForm, setRecordForm] = useState(initialRecord);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');

  const latestRecord = useMemo(() => {
    const records = studentDetail?.records || [];
    return records.length > 0 ? records[records.length - 1] : null;
  }, [studentDetail]);

  const chartData = useMemo(() => {
    if (!studentDetail?.records) return [];
    return studentDetail.records.map((item) => ({
      label: new Date(item.recordedAt).toLocaleDateString(),
      riskScore: Number(item.prediction.riskScore.toFixed(2)),
      examScore: item.examScore,
    }));
  }, [studentDetail]);

  const classRiskDistribution = useMemo(() => {
    const base = { High: 0, Medium: 0, Low: 0 };
    (dashboard?.recentRecords || []).forEach((record) => {
      const level = record?.prediction?.riskLevel || 'Low';
      base[level] += 1;
    });

    return [
      { name: 'High', value: base.High },
      { name: 'Medium', value: base.Medium },
      { name: 'Low', value: base.Low },
    ];
  }, [dashboard]);

  const studentPerformanceBars = useMemo(() => {
    const grouped = new Map();
    (dashboard?.recentRecords || []).forEach((record) => {
      const key = record?.student?._id;
      if (!key) return;

      const existing = grouped.get(key) || {
        name: record.student.name,
        examTotal: 0,
        count: 0,
      };

      existing.examTotal += record.examScore;
      existing.count += 1;
      grouped.set(key, existing);
    });

    return Array.from(grouped.values()).map((item) => ({
      name: item.name.split(' ')[0],
      examAverage: Number((item.examTotal / item.count).toFixed(2)),
    }));
  }, [dashboard]);

  const selectedStudentRadar = useMemo(() => {
    const records = studentDetail?.records || [];
    if (records.length === 0) return [];

    const latest = records[records.length - 1];
    return [
      { subject: 'Attendance', score: latest.attendance },
      { subject: 'Assignment', score: latest.assignmentScore },
      { subject: 'Exam', score: latest.examScore },
      { subject: 'Participation', score: latest.participationScore },
      { subject: 'Behavior', score: latest.behaviorScore },
    ];
  }, [studentDetail]);

  const fetchDashboard = async () => {
    const { data } = await teacherService.dashboard();
    setDashboard(data.data);
    if (!selectedStudent && data.data.students.length > 0) {
      setSelectedStudent(data.data.students[0]._id);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    if (!studentId) return;
    const { data } = await teacherService.studentDetails(studentId);
    setStudentDetail(data.data);
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoadError('');
        const { data } = await teacherService.dashboard();
        if (!isMounted) return;
        setDashboard(data.data);
        if (!selectedStudent && data.data.students.length > 0) {
          setSelectedStudent(data.data.students[0]._id);
        }
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error.response?.data?.message || 'Failed to load teacher dashboard');
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!selectedStudent) return;
      try {
        const { data } = await teacherService.studentDetails(selectedStudent);
        if (!isMounted) return;
        setStudentDetail(data.data);
      } catch (error) {
        if (!isMounted) return;
        setMessage(error.response?.data?.message || 'Failed to load student details');
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [selectedStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const numericFields = new Set([
      'attendance',
      'assignmentScore',
      'examScore',
      'participationScore',
      'behaviorScore',
      'totalLectures',
      'daysToExam',
      'internalScore',
      'internalMax',
      'finalMax',
      'passTarget',
      'averageTarget',
      'highTarget',
    ]);

    setRecordForm((prev) => ({
      ...prev,
      [name]: numericFields.has(name) ? Number(value) : value,
    }));
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setMessage('Saving record...');

    try {
      await teacherService.saveRecord(selectedStudent, {
        ...recordForm,
        examScores: String(recordForm.examScores || '')
          .split(',')
          .map((value) => Number(value.trim()))
          .filter((value) => !Number.isNaN(value)),
        className: dashboard.teacher.className,
      });
      setMessage('Performance updated successfully');
      fetchStudentDetails(selectedStudent);
      fetchDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save record');
    }
  };

  return (
    <DashboardLayout title="Teacher Intelligence Panel">
      {!dashboard ? (
        <div className="center-screen">
          {loadError ? `Teacher dashboard error: ${loadError}` : 'Loading class dashboard...'}
        </div>
      ) : (
        <>
          <div className="tab-bar" style={{ marginBottom: '1rem' }}>
            <button type="button" className={`tab ${currentView === 'overview' ? 'active' : ''}`} onClick={() => setSearchParams({ view: 'overview' })}>
              My Class
            </button>
            <button type="button" className={`tab ${currentView === 'students' ? 'active' : ''}`} onClick={() => setSearchParams({ view: 'students' })}>
              Students
            </button>
            <button type="button" className={`tab ${currentView === 'risk' ? 'active' : ''}`} onClick={() => setSearchParams({ view: 'risk' })}>
              Risk Analysis
            </button>
            <button type="button" className={`tab ${currentView === 'feedback' ? 'active' : ''}`} onClick={() => setSearchParams({ view: 'feedback' })}>
              Feedback
            </button>
          </div>

          <section className="panel-card teacher-kpi-panel">
            <h3 className="card-title">Class Performance Summary</h3>
            <div className="teacher-kpi-rows">
              <div className="teacher-kpi-row">
                <span className="teacher-kpi-label">Total Students</span>
                <strong className="teacher-kpi-value">{dashboard.kpis.totalStudents}</strong>
              </div>
              <div className="teacher-kpi-row">
                <span className="teacher-kpi-label">High Risk Students</span>
                <strong className="teacher-kpi-value danger">{dashboard.kpis.highRiskStudents}</strong>
              </div>
              <div className="teacher-kpi-row">
                <span className="teacher-kpi-label">Average Risk Score</span>
                <strong className="teacher-kpi-value">{dashboard.kpis.averageRiskScore}</strong>
              </div>
              <div className="teacher-kpi-row">
                <span className="teacher-kpi-label">Assigned Class</span>
                <strong className="teacher-kpi-value">{dashboard.teacher.className || 'N/A'}</strong>
              </div>
            </div>
          </section>

          {(currentView === 'overview' || currentView === 'students') && (
            <section className="panel-card split-panel">
              <div>
                <h3>Student-wise Analysis</h3>
                <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                  {dashboard.students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>

                {latestRecord && (
                  <div className="student-highlight">
                    <p>Latest Risk:</p>
                    <Badge variant={(latestRecord.prediction.riskLevel || 'low').toLowerCase()}>
                      {latestRecord.prediction.riskLevel}
                    </Badge>
                    <p>Score: {latestRecord.prediction.riskScore.toFixed(1)}</p>
                  </div>
                )}
              </div>

              <div>
                <h3>Update Student Performance</h3>
                <p className="muted-text">Enter latest academic indicators to generate adaptive predictions.</p>
                <form className="stack-form" onSubmit={handleSaveRecord}>
                  <div className="form-group-box">
                    <div className="form-group-title">1. Student and subject</div>
                    <label className="form-label" htmlFor="subject">Subject</label>
                    <input id="subject" name="subject" value={recordForm.subject} onChange={handleChange} placeholder="e.g. Mathematics" required />
                  </div>

                  <div className="form-group-box">
                    <div className="form-group-title">2. Core performance</div>
                    <div className="form-grid-2">
                      <div>
                        <label className="form-label" htmlFor="attendance">Attendance (%)</label>
                        <input id="attendance" name="attendance" type="number" min="0" max="100" value={recordForm.attendance} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="form-label" htmlFor="assignmentScore">Assignment (%)</label>
                        <input id="assignmentScore" name="assignmentScore" type="number" min="0" max="100" value={recordForm.assignmentScore} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="form-label" htmlFor="examScore">Exam (%)</label>
                        <input id="examScore" name="examScore" type="number" min="0" max="100" value={recordForm.examScore} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="form-label" htmlFor="participationScore">Participation (%)</label>
                        <input id="participationScore" name="participationScore" type="number" min="0" max="100" value={recordForm.participationScore} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="form-label" htmlFor="behaviorScore">Behavior (%)</label>
                        <input id="behaviorScore" name="behaviorScore" type="number" min="0" max="100" value={recordForm.behaviorScore} onChange={handleChange} required />
                      </div>
                    </div>
                  </div>

                  <div className="form-group-box">
                    <div className="form-group-title">3. Exam history and attendance planning</div>
                    <div className="form-grid-2">
                      <div>
                        <label className="form-label" htmlFor="examScores">Exam History</label>
                        <input id="examScores" name="examScores" value={recordForm.examScores} onChange={handleChange} placeholder="e.g. 80,85,50" />
                      </div>
                      <div>
                        <label className="form-label" htmlFor="totalLectures">Total Lectures</label>
                        <input id="totalLectures" name="totalLectures" type="number" min="0" value={recordForm.totalLectures} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="form-label" htmlFor="daysToExam">Days to Exam</label>
                        <input id="daysToExam" name="daysToExam" type="number" min="0" value={recordForm.daysToExam} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="form-group-box">
                    <div className="form-group-title">4. Target score planning</div>
                    <div className="form-grid-2">
                      <div>
                        <label className="form-label" htmlFor="internalScore">Internal Score</label>
                        <input id="internalScore" name="internalScore" type="number" min="0" value={recordForm.internalScore} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="form-label" htmlFor="internalMax">Internal Max</label>
                        <input id="internalMax" name="internalMax" type="number" min="1" value={recordForm.internalMax} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="form-label" htmlFor="finalMax">Final Max</label>
                        <input id="finalMax" name="finalMax" type="number" min="1" value={recordForm.finalMax} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="form-label" htmlFor="passTarget">Pass Target</label>
                        <input id="passTarget" name="passTarget" type="number" min="0" value={recordForm.passTarget} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="form-label" htmlFor="averageTarget">Average Target</label>
                        <input id="averageTarget" name="averageTarget" type="number" min="0" value={recordForm.averageTarget} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="form-label" htmlFor="highTarget">Excellent Target</label>
                        <input id="highTarget" name="highTarget" type="number" min="0" value={recordForm.highTarget} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button className="btn" type="submit">Save & Predict</button>
                  </div>
                </form>
                <p className="muted-text">{message}</p>
              </div>
            </section>
          )}

          {(currentView === 'risk' || currentView === 'overview') && latestRecord && (
            <section className="panel-card split-panel">
              <div>
                <h3>Adaptive Learning Recommendation</h3>
                <p>
                  Category:{' '}
                  <strong>{latestRecord.prediction?.category || 'N/A'}</strong>
                </p>
                <p>
                  Suggested difficulty:{' '}
                  <strong>{latestRecord.prediction?.suggestedDifficulty || 'N/A'}</strong>
                </p>
                <p className="muted-text">
                  {latestRecord.prediction?.categorizationReason || 'No reason available.'}
                </p>
              </div>

              <div>
                <h3>Exam Shock Detector</h3>
                {latestRecord.prediction?.examShock?.detected ? (
                  <p className="error-text">
                    {latestRecord.prediction?.examShock?.explanation}
                  </p>
                ) : (
                  <p className="muted-text">
                    {latestRecord.prediction?.examShock?.explanation || 'No exam shock detected.'}
                  </p>
                )}
              </div>
            </section>
          )}

          {(currentView === 'overview' || currentView === 'risk') && (
            <>
              <section className="two-col">
                <Card title="Class Risk Distribution">
                  <DonutChart data={classRiskDistribution} />
                </Card>
                <Card title="Student Exam Averages">
                  <BarChart data={studentPerformanceBars} xKey="name" dataKey="examAverage" color="#4f46e5" />
                </Card>
              </section>

              <section className="panel-card">
                <h3 className="card-title">Selected Student Factor Analytics</h3>
                {selectedStudentRadar.length > 0 ? (
                  <RadarChart data={selectedStudentRadar} dataKey="score" nameKey="subject" color="#7c3aed" />
                ) : (
                  <p className="muted-text">No sufficient data for radar analytics yet.</p>
                )}
              </section>

              <TrendChart data={chartData} title="Student Risk Trend Over Time" />
            </>
          )}

          {(currentView === 'students' || currentView === 'feedback') && <RecordTable rows={dashboard.recentRecords} />}

          {currentView === 'feedback' && (
            <section className="panel-card">
              <h3 className="card-title">Teacher Feedback Hub</h3>
              <p className="muted-text">
                Use updated performance records to post personalized notes, practice tasks, and test difficulty recommendations.
              </p>
            </section>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default TeacherDashboard;
