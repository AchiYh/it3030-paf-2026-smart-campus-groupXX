function TicketBoardPage() {
  const columns = [
    { title: 'Open', badge: 'badge-open' },
    { title: 'In Progress', badge: 'badge-in-progress' },
    { title: 'Resolved', badge: 'badge-resolved' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.875rem' }}>
      {columns.map((column) => (
        <div key={column.title} className="card" style={{ minHeight: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem' }}>{column.title}</h3>
            <span className={`badge ${column.badge}`}>0</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Board column scaffold ready for drag-and-drop tickets.
          </p>
        </div>
      ))}
    </div>
  );
}

export default TicketBoardPage;
