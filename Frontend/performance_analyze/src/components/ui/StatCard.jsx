import { TiltCard } from './motionPrimitives';

function StatCard({ label, value, accent = 'teal' }) {
  return (
    <TiltCard className={`metric-card stat-${accent}`}>
      <div className="metric-val">{value}</div>
      <p className="metric-label">{label}</p>
    </TiltCard>
  );
}

export default StatCard;
