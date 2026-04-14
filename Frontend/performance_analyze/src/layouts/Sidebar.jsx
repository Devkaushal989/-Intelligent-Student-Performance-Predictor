import { Link, NavLink, useLocation } from 'react-router-dom';

function Sidebar({ user, navSections = [], onLogout }) {
  const location = useLocation();
  const currentPath = `${location.pathname}${location.search}`;

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

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.section}>
            <div className="nav-section">{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) => {
                    if (!location.search && item.to.endsWith('?view=overview') && currentPath.startsWith('/admin')) {
                      return 'nav-item nav-item-active';
                    }

                    if (!location.search && item.to.endsWith('?view=dashboard') && currentPath.startsWith('/student')) {
                      return 'nav-item nav-item-active';
                    }

                    if (!location.search && item.to.endsWith('?view=overview') && currentPath.startsWith('/teacher')) {
                      return 'nav-item nav-item-active';
                    }

                    if (item.to.includes('?view=')) {
                      return currentPath === item.to ? 'nav-item nav-item-active' : 'nav-item';
                    }

                    return isActive ? 'nav-item nav-item-active' : 'nav-item';
                  }}
                >
                  <span className="nav-item-icon">{Icon ? <Icon size={15} aria-hidden="true" /> : null}</span>
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="btn-logout" onClick={onLogout}>
          ← Sign out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
