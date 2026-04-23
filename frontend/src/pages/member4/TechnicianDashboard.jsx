import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function TechnicianDashboard() {
  const { user } = useAuth();
  
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Tech Console - {user?.email}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Assigned Tickets</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>View only the tickets assigned to you.</p>
          <Link to="/tickets/list" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Open My Tickets
          </Link>
        </div>

      </div>
    </div>
  );
}

export default TechnicianDashboard;
