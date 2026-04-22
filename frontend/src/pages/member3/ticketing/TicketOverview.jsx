import { useEffect, useMemo, useState } from 'react';
import ticketService from '../../../services/member3/ticketService';
import { useAuth } from '../../../context/AuthContext';

const STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  OVERDUE: 'OVERDUE',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
};

const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function getRangeBounds(rangeValue, sourceTickets) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  if (rangeValue === 'all') {
    const datedTickets = sourceTickets
      .map((ticket) => parseDate(ticket?.createdAt))
      .filter(Boolean)
      .sort((a, b) => a.getTime() - b.getTime());

    if (!datedTickets.length) {
      const start = new Date(end);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }

    const start = new Date(datedTickets[0]);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  const days = Number(rangeValue);
  const start = new Date(end);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return { start, end };
}

function inRange(isoDate, bounds) {
  const date = parseDate(isoDate);
  if (!date) return false;
  return date >= bounds.start && date <= bounds.end;
}

function toPercent(value, total) {
  if (!total) return 0;
  return Number(((value / total) * 100).toFixed(1));
}

function buildGroupedCounts(tickets, keyResolver) {
  return tickets.reduce((acc, ticket) => {
    const key = keyResolver(ticket);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
}

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];

  rows.forEach((row) => {
    lines.push(headers.map((header) => esc(row[header])).join(','));
  });

  return lines.join('\n');
}

function countByStatus(tickets, status) {
  return tickets.filter((ticket) => (ticket?.status || '').toUpperCase() === status).length;
}

function TicketOverview() {
  const { isAdmin } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState('30');

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

  const rangeBounds = useMemo(() => getRangeBounds(range, tickets), [range, tickets]);

  const filteredTickets = useMemo(
    () => tickets.filter((ticket) => inRange(ticket?.createdAt, rangeBounds)),
    [tickets, rangeBounds]
  );

  const selectedRangeLabel = useMemo(
    () => RANGE_OPTIONS.find((option) => option.value === range)?.label || 'Selected range',
    [range]
  );

  const stats = useMemo(() => {
    const total = filteredTickets.length;
    const open = countByStatus(filteredTickets, STATUS.OPEN);
    const inProgress = countByStatus(filteredTickets, STATUS.IN_PROGRESS);
    const overdue = countByStatus(filteredTickets, STATUS.OVERDUE);
    const resolved = countByStatus(filteredTickets, STATUS.RESOLVED);
    const rejected = countByStatus(filteredTickets, STATUS.REJECTED);
    const closed = countByStatus(filteredTickets, STATUS.CLOSED);

    const avgResolutionHours = (() => {
      const resolutionHours = filteredTickets
        .map((ticket) => {
          const createdAt = parseDate(ticket?.createdAt);
          const doneAt = parseDate(ticket?.resolvedAt) || parseDate(ticket?.closedAt);
          if (!createdAt || !doneAt) return null;
          return (doneAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        })
        .filter((value) => value !== null && value >= 0);

      if (!resolutionHours.length) return '-';
      const avg = resolutionHours.reduce((sum, value) => sum + value, 0) / resolutionHours.length;
      return `${avg.toFixed(1)}h`;
    })();

    if (isAdmin) {
      return [
        { label: 'TOTAL TICKETS', value: total, accent: '#5e86ba', spot: 'rgba(94, 134, 186, 0.14)', subLabel: 'In selected period' },
        { label: 'OPEN TICKETS', value: open, accent: '#d5ad58', spot: 'rgba(213, 173, 88, 0.14)', subLabel: 'Awaiting action' },
        { label: 'OVERDUE', value: overdue, accent: '#ef4444', spot: 'rgba(239, 68, 68, 0.16)', subLabel: 'Past deadline' },
        { label: 'RESOLVED', value: resolved, accent: '#8fb478', spot: 'rgba(143, 180, 120, 0.14)', subLabel: 'Successfully closed' },
        { label: 'AVG RESOLUTION', value: avgResolutionHours, accent: '#a678af', spot: 'rgba(166, 120, 175, 0.14)', subLabel: 'Created to resolved/closed' },
      ];
    }

    return [
      { label: 'TOTAL', value: total, accent: '#5e86ba', spot: 'rgba(94, 134, 186, 0.14)' },
      { label: 'OPEN', value: open, accent: '#d5ad58', spot: 'rgba(213, 173, 88, 0.14)' },
      { label: 'IN PROGRESS', value: inProgress, accent: '#a678af', spot: 'rgba(166, 120, 175, 0.14)' },
      { label: 'OVERDUE', value: overdue, accent: '#ef4444', spot: 'rgba(239, 68, 68, 0.16)' },
      { label: 'RESOLVED', value: resolved, accent: '#8fb478', spot: 'rgba(143, 180, 120, 0.14)' },
      { label: 'REJECTED', value: rejected, accent: '#e17f7f', spot: 'rgba(225, 127, 127, 0.14)' },
      { label: 'CLOSED', value: closed, accent: '#7f8999', spot: 'rgba(127, 137, 153, 0.14)' },
    ];
  }, [filteredTickets, isAdmin]);

  const categoryDistribution = useMemo(() => {
    const grouped = buildGroupedCounts(filteredTickets, (ticket) => String(ticket?.category || 'OTHER').toUpperCase());
    const total = filteredTickets.length;
    return Object.entries(grouped)
      .map(([label, count]) => ({
        label,
        count,
        percent: toPercent(count, total),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredTickets]);

  const priorityDistribution = useMemo(() => {
    const grouped = buildGroupedCounts(filteredTickets, (ticket) => String(ticket?.priority || '').toUpperCase());
    const total = filteredTickets.length;
    const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    return order
      .filter((priority) => grouped[priority])
      .map((priority) => ({
        label: priority,
        count: grouped[priority],
        percent: toPercent(grouped[priority], total),
      }));
  }, [filteredTickets]);

  const trendRows = useMemo(() => {
    const rowsByDate = filteredTickets.reduce((acc, ticket) => {
      const createdAt = parseDate(ticket?.createdAt);
      if (!createdAt) return acc;

      const dayKeyDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
      const key = dayKeyDate.toISOString().slice(0, 10);
      if (!acc[key]) {
        acc[key] = {
          date: formatShortDate(dayKeyDate),
          open: 0,
          inProgress: 0,
          overdue: 0,
          resolved: 0,
          closed: 0,
        };
      }

      const status = String(ticket?.status || '').toUpperCase();
      if (status === STATUS.OPEN) acc[key].open += 1;
      if (status === STATUS.IN_PROGRESS) acc[key].inProgress += 1;
      if (status === STATUS.OVERDUE) acc[key].overdue += 1;
      if (status === STATUS.RESOLVED) acc[key].resolved += 1;
      if (status === STATUS.CLOSED) acc[key].closed += 1;
      return acc;
    }, {});

    return Object.entries(rowsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value);
  }, [filteredTickets]);

  const visibleTrendRows = trendRows;

  const handleExportCsv = () => {
    const rows = filteredTickets.map((ticket) => ({
      id: ticket?.id || '',
      title: ticket?.title || '',
      status: ticket?.status || '',
      priority: ticket?.priority || '',
      category: ticket?.category || '',
      reportedBy: ticket?.reportedBy || '',
      assignedTo: ticket?.assignedTo || '',
      createdAt: ticket?.createdAt || '',
      resolvedAt: ticket?.resolvedAt || '',
      closedAt: ticket?.closedAt || '',
    }));

    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleGeneratePdf = () => {
    window.print();
  };

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

      {isAdmin && (
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>Analytics & Reports</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Insights and exportable reports across tickets</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-success" type="button" onClick={handleExportCsv}>
                Export CSV
              </button>
              <button className="btn btn-primary" type="button" onClick={handleGeneratePdf}>
                Generate PDF
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.85rem' }}>
            <select className="form-control" value={range} onChange={(event) => setRange(event.target.value)} style={{ maxWidth: '180px' }}>
              {RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{filteredTickets.length} tickets in range</p>
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${isAdmin ? 220 : 170}px, 1fr))`,
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
            {item.subLabel && (
              <p style={{ marginTop: '0.45rem', marginBottom: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {item.subLabel}
              </p>
            )}
          </article>
        ))}
      </div>

      {isAdmin && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
            <section className="card" style={{ padding: '1rem' }}>
              <h3 style={{ marginBottom: '0.9rem' }}>Category Distribution</h3>
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                {categoryDistribution.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No category data in selected range.</p>
                )}
                {categoryDistribution.map((item) => (
                  <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 110px', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.label}</span>
                    <div style={{ height: '10px', borderRadius: '999px', background: 'rgba(148,163,184,0.18)', overflow: 'hidden' }}>
                      <div style={{ width: `${item.percent}%`, height: '100%', background: '#5e86ba' }} />
                    </div>
                    <span style={{ color: 'var(--text-secondary)', textAlign: 'right', fontSize: '0.85rem' }}>{item.count} ({item.percent}%)</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card" style={{ padding: '1rem' }}>
              <h3 style={{ marginBottom: '0.9rem' }}>Priority Distribution</h3>
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                {priorityDistribution.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No priority data in selected range.</p>
                )}
                {priorityDistribution.map((item) => {
                  const tone = item.label === 'CRITICAL'
                    ? '#ef4444'
                    : item.label === 'HIGH'
                      ? '#f97316'
                      : item.label === 'MEDIUM'
                        ? '#facc15'
                        : '#22c55e';

                  return (
                    <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 110px', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ color: tone, fontWeight: 700 }}>{item.label}</span>
                      <div style={{ height: '10px', borderRadius: '999px', background: 'rgba(148,163,184,0.18)', overflow: 'hidden' }}>
                        <div style={{ width: `${item.percent}%`, height: '100%', background: tone }} />
                      </div>
                      <span style={{ color: 'var(--text-secondary)', textAlign: 'right', fontSize: '0.85rem' }}>{item.count} ({item.percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="card" style={{ padding: '1rem' }}>
            <h3 style={{ marginBottom: '0.8rem' }}>Status Trend - {selectedRangeLabel}</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Open</th>
                    <th>In Progress</th>
                    <th>Overdue</th>
                    <th>Resolved</th>
                    <th>Closed</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTrendRows.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No status activity for the selected range.
                      </td>
                    </tr>
                  )}
                  {visibleTrendRows.map((row) => (
                    <tr key={row.date}>
                      <td>{row.date}</td>
                      <td>{row.open}</td>
                      <td>{row.inProgress}</td>
                      <td>{row.overdue}</td>
                      <td>{row.resolved}</td>
                      <td>{row.closed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  );
}

export default TicketOverview;
