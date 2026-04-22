import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/member4/NotificationBell';
import { useState } from 'react';

function MainLayout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookingsOpen, setBookingsOpen] = useState(false);

  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  const isBookingActive = () => {
    return ['/bookings', '/bookings/find', '/bookings/my'].includes(location.pathname);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookingsOpen(!bookingsOpen);
  };
  // Don't show layout on login or oauth redirect pages
  if (location.pathname === '/login' || location.pathname === '/oauth2/redirect') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Home', path: '/', icon: '🏠' },
    { label: 'Tickets', path: '/tickets', icon: '🎫' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'Add Technician', path: '/users/technicians/new', icon: '➕' });
    navItems.push({ label: 'Users', path: '/users', icon: '👥' });
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '0px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{ padding: '1.5rem', whiteSpace: 'nowrap' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            🏫 Smart Campus
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Operations Hub
          </p>
        </div>

        <nav style={{ padding: '0 0.75rem' }}>
          <p style={{
            fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--text-muted)',
            padding: '0.75rem 0.75rem 0.5rem', whiteSpace: 'nowrap',
          }}>
            Main Menu
          </p>

          {/* Home link */}
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.625rem 0.75rem', borderRadius: '8px',
            color: isActive('/') ? 'var(--primary-light)' : 'var(--text-secondary)',
            background: isActive('/') ? 'rgba(99,102,241,0.1)' : 'transparent',
            marginBottom: '0.25rem', whiteSpace: 'nowrap', fontSize: '0.875rem',
            transition: 'var(--transition)',
            textDecoration: 'none',
          }}>
            <span>🏠</span> Home
          </Link>

          {/* Booking Dashboard dropdown */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.25rem',
            }}>
              <Link
                to="/bookings"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '8px',
                  color: isBookingActive() ? 'var(--primary-light)' : 'var(--text-secondary)',
                  background: isBookingActive() ? 'rgba(99,102,241,0.1)' : 'transparent',
                  whiteSpace: 'nowrap',
                  fontSize: '0.875rem',
                  transition: 'var(--transition)',
                  textDecoration: 'none',
                  flex: 1,
                }}
              >
                <span>📊</span> Booking Dashboard
              </Link>
              <button
                onClick={toggleDropdown}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  padding: '0.625rem 0.5rem',
                  borderRadius: '8px',
                  transition: 'var(--transition)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Toggle bookings menu"
              >
                {bookingsOpen ? '▼' : '▶'}
              </button>
            </div>

            {bookingsOpen && (
              <div style={{ marginLeft: '1.5rem', marginBottom: '0.5rem' }}>
                <Link
                  to="/bookings/find"
                  style={{
                    display: 'block',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    color: isActive('/bookings/find') ? 'var(--primary-light)' : 'var(--text-secondary)',
                    background: isActive('/bookings/find') ? 'rgba(99,102,241,0.1)' : 'transparent',
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    marginBottom: '0.2rem',
                    transition: 'var(--transition)',
                  }}
                >
                  🔍 Find Resources
                </Link>
                <Link
                  to="/bookings/my"
                  style={{
                    display: 'block',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    color: isActive('/bookings/my') ? 'var(--primary-light)' : 'var(--text-secondary)',
                    background: isActive('/bookings/my') ? 'rgba(99,102,241,0.1)' : 'transparent',
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    marginBottom: '0.2rem',
                    transition: 'var(--transition)',
                  }}
                >
                  📋 My Bookings
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1.5rem',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            fontSize: '1.25rem', cursor: 'pointer',
          }}>
            ☰
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {user?.email}
                </span>
                <span className="badge badge-info" style={{ fontSize: '0.625rem' }}>
                  {user?.role}
                </span>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
          <div className="container fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;