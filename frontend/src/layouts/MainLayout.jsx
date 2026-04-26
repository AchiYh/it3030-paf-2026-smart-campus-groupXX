import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/member4/NotificationBell';
import { useEffect, useState } from 'react';
import './MainLayout.css';

function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('campus-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('campus-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const standalonePaths = ['/login', '/signup', '/verify', '/forgot-password', '/oauth2/redirect'];
  if (standalonePaths.includes(location.pathname)) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const role = user?.role?.replace('ROLE_', '') || 'STUDENT';
  
  const getNavItems = () => {
    const common = [
      { label: 'Dashboard', path: '/', icon: '📊', group: 'Core Telemetry' },
      { label: 'Profile', path: '/profile', icon: '👤', group: 'Core Telemetry' },
    ];

    if (role === 'ADMIN') {
      return [
        ...common,
        { label: 'User Management', path: '/users', icon: '👥', group: 'Administration' },
        { label: 'Add Technician', path: '/users/technicians/new', icon: '🛠️', group: 'Administration' },
        { label: 'Manage Bookings', path: '/admin/bookings', icon: '📋', group: 'Operations' },
        { label: 'Resource Hub', path: '/infrastructure', icon: '🏢', group: 'Operations' },
        { label: 'All Tickets', path: '/tickets', icon: '🎫', group: 'Operations' },
      ];
    } else if (role === 'TECHNICIAN') {
      return [
        ...common,
        { label: 'My Assigned Tickets', path: '/tickets/list', icon: '🎫', group: 'Maintenance' },
      ];
    } else {
      return [
        ...common,
        { label: 'Resource Hub', path: '/infrastructure', icon: '🏢', group: 'Student Assets' },
        { label: 'Booking Hub', path: '/bookings', icon: '📅', group: 'Student Assets' },
        { label: 'Incident Report', path: '/tickets/new', icon: '🚨', group: 'Student Assets' },
        { label: 'My Tickets', path: '/tickets/list', icon: '📜', group: 'Student Assets' },
      ];
    }
  };

  const navItems = getNavItems();
  const groupedNav = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const fullName = user?.fullName || user?.email?.split('@')[0] || "User";
  const initials = fullName[0]?.toUpperCase() || "U";

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";
    const rootUrl = baseUrl.replace('/api', '');
    return rootUrl + url;
  };

  return (
    <div className="main-layout">
      <aside className="main-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo-container">
             <img src="/assets/campus_logo.png" alt="Campus Logo" className="sidebar-logo-img" />
             <div className="brand-logo">
                <strong>SMART CAMPUS</strong>
                <span>Institutional Portal</span>
             </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {Object.entries(groupedNav).map(([group, items]) => (
            <div key={group}>
              <p className="nav-label">{group}</p>
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
          
          <p className="nav-label">System</p>
          <Link className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`} to="/settings">
             <span className="nav-icon">⚙️</span> Settings
          </Link>
          <button className="sidebar-link" onClick={handleLogout} style={{ background: 'transparent', border: '0', width: '100%', cursor: 'pointer' }}>
             <span className="nav-icon">↪</span> Logout
          </button>
        </nav>
      </aside>

      <div className="main-content-wrapper">
        <header className="main-topbar">
          <div className="topbar-search-wrapper">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search resources..." className="clean-search-input" />
          </div>
          <div className="topbar-actions">
            <button onClick={toggleTheme} className="theme-toggle-btn">
               {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <div style={{ position: 'relative' }}>
              <NotificationBell />
            </div>
            <div className="user-profile-summary" onClick={() => navigate('/profile')}>
              <div className="user-text">
                <span className="user-name">{fullName}</span>
                <span className="user-role-badge">{role}</span>
              </div>
              <div className="user-avatar-frame">
                {(user?.profilePicture || user?.imageUrl) ? (
                    <img src={getImageUrl(user.profilePicture || user.imageUrl)} alt="User" className="user-avatar-img" />
                ) : (
                    <div className="user-avatar-initials">{initials}</div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;