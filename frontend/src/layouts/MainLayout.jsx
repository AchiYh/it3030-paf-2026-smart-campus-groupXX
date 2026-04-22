import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/member4/NotificationBell';
import { useState } from 'react';

function MainLayout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Don't show layout on login or oauth redirect pages
  if (location.pathname === '/login' || location.pathname === '/oauth2/redirect') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Home', path: '/', icon: '🏠' },
    { label: 'Facilities', path: '/resources', icon: '🏢' },
    { label: 'Tickets', path: '/tickets', icon: '🎫' },
  ];

  if (user?.role === 'ADMIN') {
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
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 0.75rem', borderRadius: '8px',
              color: location.pathname === item.path ? 'var(--primary-light)' : 'var(--text-secondary)',
              background: location.pathname === item.path ? 'rgba(99,102,241,0.1)' : 'transparent',
              marginBottom: '0.25rem', whiteSpace: 'nowrap', fontSize: '0.875rem',
              transition: 'var(--transition)',
            }}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
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
