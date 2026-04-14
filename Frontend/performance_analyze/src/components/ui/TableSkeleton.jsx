function TableSkeleton({ rows = 6 }) {
  return (
    <div className="panel-card table-card">
      <div className="skeleton-header" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="skeleton-row" />
      ))}
    </div>
  );
}

export default TableSkeleton;
