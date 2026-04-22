import { useEffect, useMemo, useState } from 'react';
import ticketService from '../../../services/member3/ticketService';

const STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  PENDING: 'PENDING',
};

function countByStatus(tickets, status) {
  return tickets.filter((ticket) => (ticket?.status || '').toUpperCase() === status).length;
}

function TicketOverview() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await ticketService.getTickets();
        setTickets(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load ticket overview.');
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = countByStatus(tickets, STATUS.OPEN);
    const inProgress = countByStatus(tickets, STATUS.IN_PROGRESS);
    const resolved = countByStatus(tickets, STATUS.RESOLVED);
    const pending = countByStatus(tickets, STATUS.PENDING);
    const closed = countByStatus(tickets, STATUS.CLOSED);

    return [
      { label: 'TOTAL', value: total, accent: '#5e86ba', spot: 'rgba(94, 134, 186, 0.14)' },
      { label: 'OPEN', value: open, accent: '#d5ad58', spot: 'rgba(213, 173, 88, 0.14)' },
      { label: 'IN PROGRESS', value: inProgress, accent: '#a678af', spot: 'rgba(166, 120, 175, 0.14)' },
      { label: 'RESOLVED', value: resolved, accent: '#8fb478', spot: 'rgba(143, 180, 120, 0.14)' },
      { label: 'PENDING', value: pending, accent: '#6fb2c4', spot: 'rgba(111, 178, 196, 0.14)' },
      { label: 'CLOSED', value: closed, accent: '#7f8999', spot: 'rgba(127, 137, 153, 0.14)' },
    ];
  }, [tickets]);

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      <div>
        <h2 style={{ marginBottom: '0.35rem' }}>Ticket Workspace Overview</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Status snapshot across all tickets.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem 0.9rem',
          borderRadius: '10px',
          border: '1px solid rgba(239,68,68,0.3)',
          background: 'rgba(239,68,68,0.1)',
          color: '#fca5a5',
          fontSize: '0.85rem',
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '0.85rem',
      }}>
        {stats.map((item) => (
          <article
            key={item.label}
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '16px',
              border: '1px solid rgba(148,163,184,0.2)',
              background: 'linear-gradient(180deg, rgba(248,250,252,0.08) 0%, rgba(226,232,240,0.05) 100%)',
              minHeight: '108px',
              padding: '1rem 1.1rem',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-22px',
                right: '-18px',
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                background: item.spot,
              }}
            />

            <p style={{
              margin: 0,
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              fontWeight: 700,
              color: 'rgba(226,232,240,0.72)',
            }}>
              {item.label}
            </p>

            <p style={{
              marginTop: '0.45rem',
              marginBottom: 0,
              fontSize: '2.2rem',
              lineHeight: 1,
              fontWeight: 700,
              color: item.accent,
            }}>
              {loading ? '-' : item.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TicketOverview;
