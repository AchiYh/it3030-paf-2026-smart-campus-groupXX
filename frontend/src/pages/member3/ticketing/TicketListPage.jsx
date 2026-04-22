import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ticketService from '../../../services/member3/ticketService';

function TicketListPage() {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    reportedBy: '',
    assignedTo: '',
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTickets = async (activeFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await ticketService.getTickets(activeFilters);
      setTickets(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = async (event) => {
    event.preventDefault();
    await fetchTickets(filters);
  };

  const handleResetFilters = async () => {
    const reset = {
      status: '',
      priority: '',
      category: '',
      reportedBy: '',
      assignedTo: '',
    };
    setFilters(reset);
    await fetchTickets(reset);
  };

  const getStatusBadgeClass = (status) => {
    const value = (status || '').toUpperCase();
    if (value === 'OPEN') return 'badge-open';
    if (value === 'IN_PROGRESS') return 'badge-in-progress';
    if (value === 'RESOLVED') return 'badge-resolved';
    if (value === 'CLOSED') return 'badge-closed';
    if (value === 'REJECTED') return 'badge-rejected';
    return 'badge-info';
  };

  const getPriorityBadgeClass = (priority) => {
    const value = (priority || '').toUpperCase();
    if (value === 'LOW') return 'badge-info';
    if (value === 'MEDIUM') return 'badge-warning';
    if (value === 'HIGH' || value === 'CRITICAL') return 'badge-danger';
    return 'badge-info';
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleString();
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Ticket List</h2>
        <Link className="btn btn-primary" to="/tickets/new">+ New Ticket</Link>
      </div>

      <form onSubmit={handleApplyFilters} style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.625rem' }}>
          <select className="form-control" name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <select className="form-control" name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <input className="form-control" name="category" value={filters.category} onChange={handleFilterChange} placeholder="Category" />
          <input className="form-control" name="reportedBy" value={filters.reportedBy} onChange={handleFilterChange} placeholder="Reporter ID" />
          <input className="form-control" name="assignedTo" value={filters.assignedTo} onChange={handleFilterChange} placeholder="Assignee ID" />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Filtering...' : 'Apply Filters'}
          </button>
          <button className="btn btn-secondary" type="button" onClick={handleResetFilters} disabled={loading}>
            Reset
          </button>
        </div>
      </form>

      {error && (
        <div style={{
          marginBottom: '0.75rem',
          padding: '0.625rem 0.75rem',
          borderRadius: '8px',
          color: '#fca5a5',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Assignee</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading tickets...</td>
              </tr>
            )}

            {!loading && tickets.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No tickets found for selected filters.
                </td>
              </tr>
            )}

            {!loading && tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <Link to={`/tickets/${ticket.id}`}>{ticket.id?.slice(0, 8) || '-'}</Link>
                </td>
                <td>{ticket.title || '-'}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>{ticket.status || '-'}</span>
                </td>
                <td>
                  <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>{ticket.priority || '-'}</span>
                </td>
                <td>{ticket.category || '-'}</td>
                <td>{ticket.assignedTo || 'Unassigned'}</td>
                <td>{formatDate(ticket.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TicketListPage;
