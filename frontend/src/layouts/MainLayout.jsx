import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/member4/NotificationBell';
import { useState } from 'react';

function MainLayout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Hide layout on login, signup, and verification pages
  const authPaths = ['/login', '/signup', '/verify', '/forgot-password', '/oauth2/redirect'];
  if (authPaths.includes(location.pathname)) {
    return <>{children}</>;
  }

  const isActive = (path) => location.pathname === path;
  const isActivePrefix = (prefix) => location.pathname.startsWith(prefix);

  // Get navigation items based on user role
  const getNavItems = () => {
    if (user?.role === 'ADMIN') {
      return [
        { label: 'Home', path: '/', icon: '🏠' },
        { label: 'Admin Dashboard', path: '/admin/dashboard', icon: '📊' },
        { label: 'Manage Bookings', path: '/admin/bookings', icon: '📋' },
        { label: 'Tickets', path: '/tickets', icon: '🎫' },
        { label: 'Users', path: '/users', icon: '👥' },
        { label: 'Add Technician', path: '/users/technicians/new', icon: '➕' },
      ];
    } else if (user?.role === 'TECHNICIAN') {
      return [
        { label: 'Home', path: '/', icon: '🏠' },
        { label: 'Tickets', path: '/tickets', icon: '🎫' },
      ];
    } else {
      // USER role - Booking links are now directly in main menu (no dropdown)
      return [
        { label: 'Home', path: '/', icon: '🏠' },
        { label: 'Booking Dashboard', path: '/bookings', icon: '📊' },
        { label: 'Tickets', path: '/tickets', icon: '🎫' },
      ];
    }
  };

  const navItems = getNavItems();

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
            fontSize: '0.625rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            padding: '0.75rem 0.75rem 0.5rem',
            whiteSpace: 'nowrap',
          }}>
            Main Menu
          </p>

          {/* Regular Nav Items */}
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.75rem',
                borderRadius: '8px',
                color: isActive(item.path) || (item.path === '/bookings' && isActivePrefix('/bookings')) 
                  ? 'var(--primary-light)' 
                  : 'var(--text-secondary)',
                background: isActive(item.path) || (item.path === '/bookings' && isActivePrefix('/bookings'))
                  ? 'rgba(99,102,241,0.1)' 
                  : 'transparent',
                marginBottom: '0.25rem',
                whiteSpace: 'nowrap',
                fontSize: '0.875rem',
                transition: 'var(--transition)',
                textDecoration: 'none'
              }}
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top Bar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.5rem',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '1.25rem',
            cursor: 'pointer',
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
                <button
                  onClick={logout}
                  className="btn btn-secondary"
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                >
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