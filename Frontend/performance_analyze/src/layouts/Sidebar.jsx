import { Link, NavLink, useLocation } from 'react-router-dom';

function Sidebar({ user, navSections = [], onLogout }) {
  const location = useLocation();

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
            {section.items.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => {
                  if (user.role === 'admin') {
                    const current = `${location.pathname}${location.search}`;
                    if (!location.search && item.to === '/admin?view=overview') {
                      return 'nav-item nav-item-active';
                    }
                    return current === item.to ? 'nav-item nav-item-active' : 'nav-item';
                  }
                  return isActive ? 'nav-item nav-item-active' : 'nav-item';
                }}
              >
                <span className="nav-item-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
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
