import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { navByRole } from './navConfig';

function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="main-layout dashboard-shell">
      <Sidebar user={user} navSections={navByRole[user.role] || []} onLogout={handleLogout} />

      <main className="content dashboard-main">
        <Topbar title={title} user={user} />
        <section className="page">{children}</section>
      </main>
    </div>
  );
}

export default DashboardLayout;
