export default function Loading() {
  return (
    <div role="status" aria-label="Loading dashboard">
      <div className="skeleton kpi-skeleton" />
      <div className="skeleton chart-skeleton" />
    </div>
  );
}
