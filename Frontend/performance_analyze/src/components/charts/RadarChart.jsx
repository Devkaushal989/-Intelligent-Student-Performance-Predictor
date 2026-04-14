import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as ReRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

function RadarChart({ data, dataKey = 'score', nameKey = 'subject', color = '#4f46e5' }) {
  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={260}>
        <ReRadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey={nameKey} />
          <Radar name={dataKey} dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.35} />
          <Tooltip />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RadarChart;
