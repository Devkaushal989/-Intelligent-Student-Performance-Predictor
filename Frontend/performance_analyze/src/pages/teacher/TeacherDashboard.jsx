import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
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
};

function TeacherDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentDetail, setStudentDetail] = useState(null);
  const [recordForm, setRecordForm] = useState(initialRecord);
  const [message, setMessage] = useState('');

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
      const { data } = await teacherService.dashboard();
      if (!isMounted) return;
      setDashboard(data.data);
      if (!selectedStudent && data.data.students.length > 0) {
        setSelectedStudent(data.data.students[0]._id);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [selectedStudent]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!selectedStudent) return;
      const { data } = await teacherService.studentDetails(selectedStudent);
      if (!isMounted) return;
      setStudentDetail(data.data);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [selectedStudent]);

  const handleChange = (e) => {
    setRecordForm((prev) => ({ ...prev, [e.target.name]: Number(e.target.value) || e.target.value }));
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setMessage('Saving record...');

    try {
      await teacherService.saveRecord(selectedStudent, {
        ...recordForm,
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
        <div className="center-screen">Loading class dashboard...</div>
      ) : (
        <>
          <section className="grid-4">
            <StatCard label="Students" value={dashboard.kpis.totalStudents} accent="teal" />
            <StatCard label="High Risk Students" value={dashboard.kpis.highRiskStudents} accent="coral" />
            <StatCard label="Average Risk" value={dashboard.kpis.averageRiskScore} accent="amber" />
            <StatCard label="Class" value={dashboard.teacher.className || 'N/A'} accent="blue" />
          </section>

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

              {studentDetail && studentDetail.records.length > 0 && (
                <div className="student-highlight">
                  <p>Latest Risk:</p>
                  <Badge variant={(studentDetail.records[studentDetail.records.length - 1].prediction.riskLevel || 'low').toLowerCase()}>
                    {studentDetail.records[studentDetail.records.length - 1].prediction.riskLevel}
                  </Badge>
                  <p>
                    Score: {studentDetail.records[studentDetail.records.length - 1].prediction.riskScore.toFixed(1)}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3>Update Student Performance</h3>
              <form className="stack-form" onSubmit={handleSaveRecord}>
                <input name="subject" value={recordForm.subject} onChange={handleChange} placeholder="Subject" required />
                <input name="attendance" type="number" min="0" max="100" value={recordForm.attendance} onChange={handleChange} required />
                <input name="assignmentScore" type="number" min="0" max="100" value={recordForm.assignmentScore} onChange={handleChange} required />
                <input name="examScore" type="number" min="0" max="100" value={recordForm.examScore} onChange={handleChange} required />
                <input name="participationScore" type="number" min="0" max="100" value={recordForm.participationScore} onChange={handleChange} required />
                <input name="behaviorScore" type="number" min="0" max="100" value={recordForm.behaviorScore} onChange={handleChange} required />
                <button className="btn" type="submit">
                  Save & Predict
                </button>
              </form>
              <p className="muted-text">{message}</p>
            </div>
          </section>

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

          <RecordTable rows={dashboard.recentRecords} />
        </>
      )}
    </DashboardLayout>
  );
}

export default TeacherDashboard;
