import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

function DonutChart({ data, dataKey = 'value', nameKey = 'name', colors = ['#dc2626', '#d97706', '#059669'] }) {
  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius={60} outerRadius={90}>
            {data.map((entry, index) => (
              <Cell key={`${entry[nameKey]}-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DonutChart;
