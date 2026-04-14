import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import { adminService } from '../../services/adminService';
import { exportToCsv } from '../../utils/exportCsv';

const initialUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'student',
  className: '',
  assignedTeacher: '',
};

function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'overview';

  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialUserForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState('');
  const createFormRef = useRef(null);

  const teachers = useMemo(() => users.filter((u) => u.role === 'teacher'), [users]);
  const students = useMemo(() => users.filter((u) => u.role === 'student'), [users]);

  const classesSummary = useMemo(() => {
    const map = new Map();

    students.forEach((student) => {
      const key = student.className || 'Unassigned';
      const existing = map.get(key) || {
        className: key,
        studentCount: 0,
        teacherNames: new Set(),
      };

      existing.studentCount += 1;
      if (student.assignedTeacher?.name) {
        existing.teacherNames.add(student.assignedTeacher.name);
      }
      map.set(key, existing);
    });

    return Array.from(map.values()).map((entry) => ({
      ...entry,
      teacherNames: Array.from(entry.teacherNames),
    }));
  }, [students]);

  const roleDistributionData = useMemo(
    () => [
      { name: 'Admins', value: users.filter((u) => u.role === 'admin').length },
      { name: 'Teachers', value: users.filter((u) => u.role === 'teacher').length },
      { name: 'Students', value: users.filter((u) => u.role === 'student').length },
    ],
    [users]
  );

  const accountStatusData = useMemo(
    () => [
      { name: 'Active', value: users.filter((u) => u.isActive).length },
      { name: 'Inactive', value: users.filter((u) => !u.isActive).length },
    ],
    [users]
  );

  const classRiskData = useMemo(
    () =>
      dashboard.classInsights.map((item) => ({
        className: item._id,
        riskScore: Number(item.averageRiskScore.toFixed(2)),
      })),
    [dashboard.classInsights]
  );

  const classStrengthData = useMemo(
    () =>
      classesSummary.map((entry) => ({
        className: entry.className,
        students: entry.studentCount,
      })),
    [classesSummary]
  );

  const fetchData = async () => {
    const [dashboardRes, usersRes] = await Promise.all([
      adminService.dashboard(),
      adminService.users(),
    ]);
    setDashboard(dashboardRes.data.data);
    setUsers(usersRes.data.data.users);
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const [dashboardRes, usersRes] = await Promise.all([
        adminService.dashboard(),
        adminService.users(),
      ]);

      if (!isMounted) return;
      setDashboard(dashboardRes.data.data);
      setUsers(usersRes.data.data.users);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const moveToView = (view) => {
    setSearchParams({ view });
  };

  const startCreateStudent = () => {
    moveToView('users');
    setEditingUserId(null);
    setForm({ ...initialUserForm, role: 'student' });
    setTimeout(() => createFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const startEditUser = (user) => {
    setEditingUserId(user._id);
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'student',
      className: user.className || '',
      assignedTeacher: user.assignedTeacher?._id || '',
    });
    moveToView('users');
    setTimeout(() => createFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const resetForm = () => {
    setEditingUserId(null);
    setForm(initialUserForm);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setStatus(editingUserId ? 'Updating user...' : 'Creating user...');

    try {
      if (editingUserId) {
        const payload = {
          name: form.name,
          email: form.email,
          role: form.role,
          className: form.className,
          assignedTeacher: form.role === 'student' ? form.assignedTeacher : '',
        };
        if (form.password) payload.password = form.password;

        await adminService.updateUser(editingUserId, payload);
        setStatus('User updated successfully');
      } else {
        await adminService.createUser(form);
        setStatus('User created successfully');
      }

      resetForm();
      fetchData();
    } catch (error) {
      setStatus(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleToggleActive = async (user) => {
    setBusyId(user._id);
    try {
      await adminService.updateUser(user._id, { isActive: !user.isActive });
      await fetchData();
      setStatus(`${user.name} is now ${user.isActive ? 'inactive' : 'active'}`);
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to update status');
    } finally {
      setBusyId('');
    }
  };

  const handleDeleteUser = async (user) => {
    const ok = window.confirm(`Delete ${user.name}? This will also remove linked performance records.`);
    if (!ok) return;

    setBusyId(user._id);
    try {
      await adminService.deleteUser(user._id);
      await fetchData();
      setStatus('User deleted successfully');
      if (editingUserId === user._id) resetForm();
    } catch (error) {
      setStatus(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setBusyId('');
    }
  };

  const exportUsersCsv = () => {
    const header = ['Name', 'Email', 'Role', 'Class', 'AssignedTeacher', 'Active'];
    const rows = users.map((u) => [
      u.name,
      u.email,
      u.role,
      u.className || '',
      u.assignedTeacher?.name || '',
      u.isActive ? 'Yes' : 'No',
    ]);

    exportToCsv('admin-users.csv', header, rows);
  };

  if (!dashboard) {
    return (
      <DashboardLayout title="Admin Control Center">
        <div className="center-screen">Loading admin analytics...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Control Center">
      <div className="tab-bar" style={{ marginBottom: '1rem' }}>
        <button type="button" className={`tab ${currentView === 'overview' ? 'active' : ''}`} onClick={() => moveToView('overview')}>
          Overview
        </button>
        <button type="button" className={`tab ${currentView === 'students' ? 'active' : ''}`} onClick={() => moveToView('students')}>
          Students
        </button>
        <button type="button" className={`tab ${currentView === 'analytics' ? 'active' : ''}`} onClick={() => moveToView('analytics')}>
          Analytics
        </button>
        <button type="button" className={`tab ${currentView === 'users' ? 'active' : ''}`} onClick={() => moveToView('users')}>
          Users
        </button>
        <button type="button" className={`tab ${currentView === 'classes' ? 'active' : ''}`} onClick={() => moveToView('classes')}>
          Classes
        </button>
      </div>

      <section className="grid-4">
        <StatCard label="Total Users" value={dashboard.kpis.totalUsers} accent="amber" />
        <StatCard label="Total Teachers" value={dashboard.kpis.totalTeachers} accent="teal" />
        <StatCard label="Total Students" value={dashboard.kpis.totalStudents} accent="blue" />
        <StatCard label="High Risk Records" value={dashboard.kpis.highRiskCount} accent="coral" />
      </section>

      {currentView === 'overview' && (
        <>
          <section className="panel-card split-panel">
            <div>
              <h3>Quick Actions</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                <button type="button" className="btn-primary" style={{ width: 'auto' }} onClick={startCreateStudent}>
                  + Add Student
                </button>
                <button type="button" className="btn-secondary" onClick={() => moveToView('users')}>
                  Manage Users
                </button>
                <button type="button" className="btn-secondary" onClick={exportUsersCsv}>
                  Export CSV
                </button>
              </div>
              <p className="muted-text" style={{ marginTop: 12 }}>{status}</p>
            </div>

            <div>
              <h3>Class-wise Risk Insights</h3>
              <ul className="data-list">
                {dashboard.classInsights.map((item) => (
                  <li key={item._id}>
                    <strong>{item._id}</strong>
                    <span>Average Risk: {item.averageRiskScore.toFixed(1)}</span>
                    <span>Records: {item.records}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="two-col">
            <Card title="Role Distribution">
              <DonutChart
                data={roleDistributionData}
                colors={['#4f46e5', '#0891b2', '#7c3aed']}
              />
            </Card>
            <Card title="Class Risk Scores">
              <BarChart data={classRiskData} xKey="className" dataKey="riskScore" color="#dc2626" />
            </Card>
          </section>

          <section className="panel-card table-card">
            <h3>Recent Users</h3>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 8).map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.isActive ? 'Active' : 'Inactive'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button type="button" className="btn-secondary" onClick={() => startEditUser(u)}>Edit</button>
                          <button type="button" className="btn-danger" onClick={() => handleDeleteUser(u)} disabled={busyId === u._id}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {currentView === 'students' && (
        <section className="panel-card table-card">
          <h3>Student Directory</h3>
          <div style={{ display: 'flex', gap: 8, margin: '10px 0 12px' }}>
            <button type="button" className="btn-primary" style={{ width: 'auto' }} onClick={startCreateStudent}>
              + Add Student
            </button>
            <button type="button" className="btn-secondary" onClick={exportUsersCsv}>Export CSV</button>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Class</th>
                  <th>Teacher</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.className || 'Unassigned'}</td>
                    <td>{u.assignedTeacher?.name || '-'}</td>
                    <td>{u.isActive ? 'Active' : 'Inactive'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button type="button" className="btn-secondary" onClick={() => startEditUser(u)}>Edit</button>
                        <button type="button" className="btn-secondary" onClick={() => handleToggleActive(u)} disabled={busyId === u._id}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button type="button" className="btn-danger" onClick={() => handleDeleteUser(u)} disabled={busyId === u._id}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {currentView === 'analytics' && (
        <>
          <section className="two-col">
            <Card title="Account Status">
              <DonutChart data={accountStatusData} colors={['#059669', '#d97706']} />
            </Card>
            <Card title="Class Strength">
              <BarChart data={classStrengthData} xKey="className" dataKey="students" color="#4f46e5" />
            </Card>
          </section>

          <section className="panel-card table-card">
            <h3>Risk Analytics</h3>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Average Risk Score</th>
                    <th>Total Records</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.classInsights.map((item) => (
                    <tr key={item._id}>
                      <td>{item._id}</td>
                      <td>{item.averageRiskScore.toFixed(2)}</td>
                      <td>{item.records}</td>
                      <td>
                        <Badge
                          variant={
                            item.averageRiskScore >= 65
                              ? 'high'
                              : item.averageRiskScore >= 35
                                ? 'medium'
                                : 'low'
                          }
                        >
                          {item.averageRiskScore >= 65
                            ? 'High'
                            : item.averageRiskScore >= 35
                              ? 'Medium'
                              : 'Low'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {currentView === 'users' && (
        <>
          <section className="panel-card split-panel" ref={createFormRef}>
            <div>
              <h3>{editingUserId ? 'Edit User' : 'Create User'}</h3>
              <form className="stack-form" onSubmit={handleSubmitUser}>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={editingUserId ? 'New password (optional)' : 'Password'}
                  required={!editingUserId}
                />
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
                <input name="className" value={form.className} onChange={handleChange} placeholder="Class (optional)" />
                {form.role === 'student' && (
                  <select name="assignedTeacher" value={form.assignedTeacher} onChange={handleChange}>
                    <option value="">Assign teacher (optional)</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name} ({teacher.email})
                      </option>
                    ))}
                  </select>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn-primary" style={{ width: 'auto' }} type="submit">
                    {editingUserId ? 'Save Changes' : 'Create User'}
                  </button>
                  {editingUserId && (
                    <button className="btn-secondary" type="button" onClick={resetForm}>
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
              <p className="muted-text" style={{ marginTop: 10 }}>{status}</p>
            </div>

            <div>
              <h3>Admin Actions</h3>
              <ul className="data-list compact">
                <li>All user actions are now connected to backend APIs.</li>
                <li>Edit updates role, class assignment and credentials.</li>
                <li>Activate/Deactivate updates access instantly.</li>
                <li>Delete removes the user and linked records.</li>
              </ul>
              <div style={{ marginTop: 12 }}>
                <button type="button" className="btn-secondary" onClick={exportUsersCsv}>Download users CSV</button>
              </div>
            </div>
          </section>

          <section className="panel-card table-card">
            <h3>User Directory</h3>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Class</th>
                    <th>Teacher</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.className || '-'}</td>
                      <td>{u.assignedTeacher?.name || '-'}</td>
                      <td>{u.isActive ? 'Active' : 'Inactive'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button type="button" className="btn-secondary" onClick={() => startEditUser(u)}>Edit</button>
                          <button type="button" className="btn-secondary" onClick={() => handleToggleActive(u)} disabled={busyId === u._id}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button type="button" className="btn-danger" onClick={() => handleDeleteUser(u)} disabled={busyId === u._id}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {currentView === 'classes' && (
        <section className="panel-card table-card">
          <h3>Class Directory</h3>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Students</th>
                  <th>Teachers</th>
                </tr>
              </thead>
              <tbody>
                {classesSummary.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="empty-cell">No classes found yet.</td>
                  </tr>
                ) : (
                  classesSummary.map((entry) => (
                    <tr key={entry.className}>
                      <td>{entry.className}</td>
                      <td>{entry.studentCount}</td>
                      <td>{entry.teacherNames.length ? entry.teacherNames.join(', ') : 'Unassigned'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;
