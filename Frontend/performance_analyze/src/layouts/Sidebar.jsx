import { motion } from 'framer-motion';
import { Link, NavLink, useLocation } from 'react-router-dom';

function Sidebar({ user, navSections = [], onLogout }) {
  const location = useLocation();
  const currentPath = `${location.pathname}${location.search}`;

  const isItemActive = (item, isActive) => {
    if (!location.search && item.to.endsWith('?view=overview') && currentPath.startsWith('/admin')) {
      return true;
    }

    if (!location.search && item.to.endsWith('?view=dashboard') && currentPath.startsWith('/student')) {
      return true;
    }

    if (!location.search && item.to.endsWith('?view=overview') && currentPath.startsWith('/teacher')) {
      return true;
    }

    if (item.to.includes('?view=')) {
      return currentPath === item.to;
    }

    return isActive;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link className="sidebar-logo" to={`/${user.role}`}>
          <div className="sidebar-logo-icon">IS</div>
          <div>
            <div className="sidebar-logo-text">ISPP</div>
            <div className="sidebar-logo-sub">Predictor v2.0</div>
          </div>
        </Link>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-row">
          <div className="user-avatar" style={{ background: '#4f46e5' }}>
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">{user.role.toUpperCase()}</div>
          </div>
        </div>
      </div>

      <motion.nav
        className="sidebar-nav"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
        }}
      >
        {navSections.map((section) => (
          <motion.div key={section.section} variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}>
            <div className="nav-section">{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) => {
                    const active = isItemActive(item, isActive);
                    return active ? 'nav-item nav-item-active' : 'nav-item';
                  }}
                >
                  {({ isActive }) => {
                    const active = isItemActive(item, isActive);

                    return (
                      <>
                        {active && <motion.span layoutId="sidebar-active-pill" className="nav-active-pill" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />}
                        <span className="nav-item-icon">{Icon ? <Icon size={15} aria-hidden="true" /> : null}</span>
                        <span className="nav-item-text">{item.label}</span>
                      </>
                    );
                  }}
                </NavLink>
              );
            })}
          </motion.div>
        ))}
      </motion.nav>

      <div className="sidebar-footer">
        <button type="button" className="btn-logout" onClick={onLogout}>
          ← Sign out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
