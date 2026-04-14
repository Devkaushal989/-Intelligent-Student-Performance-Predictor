import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { navByRole } from './navConfig';
import { pageVariants, staggerContainer } from '../components/ui/motionPrimitives';

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

      <motion.main
        className="content dashboard-main"
        variants={pageVariants}
        initial="hidden"
        animate="enter"
        exit="exit"
      >
        <Topbar title={title} user={user} />
        <motion.section className="page" variants={staggerContainer} initial="hidden" animate="show">
          {children}
        </motion.section>
      </motion.main>
    </div>
  );
}

export default DashboardLayout;
