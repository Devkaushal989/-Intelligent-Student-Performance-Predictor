function Topbar({ title, user }) {
  const today = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="topbar">
      <h1>{title}</h1>
      <div className="topbar-right">
        <span className="date-tag">{today}</span>
        <div className="notif-wrap">
          <span style={{ fontSize: 16 }}>🔔</span>
          <span className="notif-count">5</span>
        </div>
        <div className="identity-chip">
          <strong>{user.name}</strong>
          <span>{user.role.toUpperCase()} • {user.email}</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
