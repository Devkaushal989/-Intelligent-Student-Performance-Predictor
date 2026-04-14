import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import useAuth from '../../hooks/useAuth';

const demoCreds = {
  admin: { email: 'admin@isp.edu', password: 'Admin@123' },
  teacher: { email: 'teacher@isp.edu', password: 'Teacher@123' },
  student: { email: 'riya@student.edu', password: 'Student@123' },
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('Pick a role tab or seed demo data to enter the correct panel.');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(form.email, form.password);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setError('');
      const { data } = await authService.seedDemo();
      const creds = data.data.credentials;
      setMessage(
        `Demo ready: admin(${creds.admin.email}), teacher(${creds.teacher.email}), student(${creds.student.email})`
      );
      setRole('admin');
      setForm({ email: creds.admin.email, password: creds.admin.password });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Demo seed unavailable or already initialized.');
    }
  };

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setForm({
      email: demoCreds[selectedRole].email,
      password: demoCreds[selectedRole].password,
    });
    setMessage(`Loaded ${selectedRole} demo credentials.`);
  };

  return (
    <div className="login-screen">
      <section className="login-card">
        <div className="login-logo">
          <div className="logo-icon">IS</div>
          <div>
            <div className="login-title">Intelligent Student Performance Predictor</div>
            <div className="login-sub">Role-based analytics for Admin, Teacher and Student</div>
          </div>
        </div>

        <div className="role-tabs">
          {['admin', 'teacher', 'student'].map((item) => (
            <button
              key={item}
              type="button"
              className={`role-tab ${role === item ? 'active' : ''}`}
              onClick={() => selectRole(item)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <p className="login-sub">{message}</p>

        <button type="button" className="btn-secondary" onClick={handleSeedDemo} style={{ width: '100%', marginBottom: '1rem' }}>
          Seed Demo Data
        </button>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              placeholder={demoCreds[role].email}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p className="demo-hint">Use the seeded demo credentials for a complete walkthrough.</p>
      </section>
    </div>
  );
}

export default LoginPage;
