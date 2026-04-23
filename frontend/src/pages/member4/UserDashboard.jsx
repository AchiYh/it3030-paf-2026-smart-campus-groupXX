import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function UserDashboard() {
  const { user } = useAuth();
  
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Welcome, {user?.email}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Quick Actions */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/tickets/new" className="btn btn-primary" style={{ textAlign: 'center' }}>
              Create Incident Ticket
            </Link>
            <Link to="/tickets/list" className="btn btn-secondary" style={{ textAlign: 'center' }}>
              My Tickets
            </Link>
          </div>
        </div>

        {/* Notifications Overview */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Recent Activity</h3>
          <p style={{ color: 'var(--text-muted)' }}>Use the notification bell to view full alerts.</p>
        </div>

      </div>
    </div>
  );
}

export default UserDashboard;
