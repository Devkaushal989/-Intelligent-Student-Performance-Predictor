import Card from '../ui/Card';
import LineChart from './LineChart';

function TrendChart({ data, xKey = 'label', title = 'Trend' }) {
  return (
    <Card title={title} className="panel-card chart-card">
      <LineChart
        data={data}
        xKey={xKey}
        lines={[
          { dataKey: 'riskScore', color: '#dc2626' },
          { dataKey: 'examScore', color: '#4f46e5' },
        ]}
      />
    </Card>
  );
}

export default TrendChart;
