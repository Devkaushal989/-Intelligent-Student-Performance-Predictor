function Topbar({ title, user }) {
  return (
    <header className="topbar">
      <h1>{title}</h1>
      <div className="topbar-right">
        <span className="date-tag">Apr 14, 2026</span>
        <div className="notif-wrap">
          <span style={{ fontSize: 16 }}>🔔</span>
          <span className="notif-count">5</span>
        </div>
        <div className="identity-chip">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
