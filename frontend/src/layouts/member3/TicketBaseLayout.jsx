import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function TicketBaseLayout() {
  const { isAdmin } = useAuth();

  const navLinkStyle = ({ isActive }) => ({
    padding: '0.5rem 0.875rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: isActive ? 'var(--primary-light)' : 'var(--text-secondary)',
    background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
    border: `1px solid ${isActive ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
    fontWeight: isActive ? 600 : 500,
    transition: 'var(--transition)',
  });

  return (
    <section className="fade-in">
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1>Ticketing Workspace</h1>
        <p>Central place for requests, progress updates, and resolution tracking.</p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.75rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <NavLink to="/tickets" end style={navLinkStyle}>Overview</NavLink>
        {!isAdmin && <NavLink to="/tickets/new" style={navLinkStyle}>Create Ticket</NavLink>}
        <NavLink to="/tickets/list" style={navLinkStyle}>List View</NavLink>
        <NavLink to="/tickets/board" style={navLinkStyle}>Board View</NavLink>
      </div>

      <Outlet />
    </section>
  );
}

export default TicketBaseLayout;
