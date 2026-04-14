import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function LineChart({ data, xKey = 'label', lines = [] }) {
  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={280}>
        <ReLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip />
          <Legend />
          {lines.map((line) => (
            <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} stroke={line.color} strokeWidth={2} />
          ))}
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChart;
