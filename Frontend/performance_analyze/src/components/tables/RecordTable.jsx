import RiskBadge from '../ui/Badge';

function RecordTable({ rows = [] }) {
  return (
    <div className="panel-card table-card">
      <h3 className="card-title">Performance Records</h3>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Subject</th>
              <th>Exam</th>
              <th>Assignment</th>
              <th>Attendance</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._id}>
                  <td>{new Date(row.recordedAt).toLocaleDateString()}</td>
                  <td>{row.student?.name || 'Self'}</td>
                  <td>{row.subject}</td>
                  <td>{row.examScore}</td>
                  <td>{row.assignmentScore}</td>
                  <td>{row.attendance}%</td>
                  <td>
                    <RiskBadge variant={(row.prediction?.riskLevel || 'low').toLowerCase()}>
                      {row.prediction?.riskLevel || 'Low'}
                    </RiskBadge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecordTable;
