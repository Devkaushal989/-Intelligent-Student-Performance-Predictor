function StatCard({ label, value, accent = 'teal' }) {
  return (
    <article className={`metric-card stat-${accent}`}>
      <div className="metric-val">{value}</div>
      <p className="metric-label">{label}</p>
    </article>
  );
}

export default StatCard;
