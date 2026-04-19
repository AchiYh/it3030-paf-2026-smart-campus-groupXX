function TicketOverview() {
  return (
    <div className="card">
      <h2 style={{ marginBottom: '0.75rem' }}>Ticket Overview</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Use this module to monitor created tickets, assignments, and lifecycle stages.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Open</p>
          <h3 style={{ marginTop: '0.35rem' }}>0</h3>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>In Progress</p>
          <h3 style={{ marginTop: '0.35rem' }}>0</h3>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Resolved</p>
          <h3 style={{ marginTop: '0.35rem' }}>0</h3>
        </div>
      </div>
    </div>
  );
}

export default TicketOverview;
