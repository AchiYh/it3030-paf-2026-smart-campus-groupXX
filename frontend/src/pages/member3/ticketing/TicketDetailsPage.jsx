import { useParams } from 'react-router-dom';

function TicketDetailsPage() {
  const { ticketId } = useParams();

  return (
    <div className="card">
      <h2 style={{ marginBottom: '0.75rem' }}>Ticket Details</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
        Selected ticket: <strong>{ticketId}</strong>
      </p>
      <p style={{ color: 'var(--text-muted)' }}>
        Detail layout scaffold is ready for summary, comments, attachments, and workflow actions.
      </p>
    </div>
  );
}

export default TicketDetailsPage;
