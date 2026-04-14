import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { MagneticButton, TiltCard, staggerContainer, staggerItem } from '../../components/ui/motionPrimitives';

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
      <motion.section className="login-shell" variants={staggerContainer} initial="hidden" animate="show">
        <motion.div className="login-showcase" variants={staggerItem}>
          <div className="login-logo">
            <div className="logo-icon">IS</div>
            <div>
              <div className="login-title">Intelligent Student Performance Predictor</div>
              <div className="login-sub">Smart decision support for Admin, Teacher, and Student panels</div>
            </div>
          </div>

          <div className="showcase-block">
            <h3>One platform, three powerful roles</h3>
            <ul className="data-list compact">
              <li>Admin: institution-wide analytics, user lifecycle, and class insights</li>
              <li>Teacher: adaptive interventions, exam-shock alerts, and risk tracking</li>
              <li>Student: explainable progress, attendance planning, and score targets</li>
            </ul>
          </div>

          <div className="showcase-chip-row">
            <span className="showcase-chip">Explainable AI</span>
            <span className="showcase-chip">Adaptive Learning</span>
            <span className="showcase-chip">Actionable Insights</span>
          </div>
        </motion.div>

        <TiltCard className="login-card motion-shimmer" variants={staggerItem}>
          <h2 className="card-title" style={{ marginBottom: 6 }}>Sign in</h2>
          <p className="login-sub" style={{ marginBottom: 14 }}>Choose a role and continue to your workspace.</p>

          <div className="role-tabs">
            {['admin', 'teacher', 'student'].map((item) => (
              <MagneticButton key={item} type="button" className={`role-tab motion-btn ${role === item ? 'active' : ''}`} onClick={() => selectRole(item)}>
                {role === item && <motion.span layoutId="login-role-active" className="role-tab-indicator" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />}
                <span className="role-tab-label">{item.charAt(0).toUpperCase() + item.slice(1)}</span>
              </MagneticButton>
            ))}
          </div>

          <p className="login-sub">{message}</p>

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

            <MagneticButton type="submit" className="btn-login motion-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in ->'}
            </MagneticButton>
          </form>

          <p className="demo-hint">Use seeded credentials for a complete end-to-end walkthrough.</p>
        </TiltCard>
      </motion.section>
    </div>
  );
}

export default LoginPage;
