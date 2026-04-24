import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';

function BookingLayout() {
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex' }}>

      {/* Booking Sidebar */}
      <aside style={{
        width: open ? '220px' : '60px',
        background: '#1e293b',
        color: 'white',
        minHeight: '100vh',
        padding: '1rem'
      }}>
        <h3>📊 Bookings</h3>

        <Link to="/bookings">Dashboard</Link><br/>
        <Link to="/bookings/find">Find Resources</Link><br/>
        <Link to="/bookings/my">My Bookings</Link>
      </aside>

      {/* Page Content */}
      <div style={{ flex: 1, padding: '1rem' }}>
        <Outlet />
      </div>
    </div>
  );
}

export default BookingLayout;