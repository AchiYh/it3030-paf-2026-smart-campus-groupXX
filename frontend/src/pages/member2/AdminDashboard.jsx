import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/member2/bookingService';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/bookings');
      return;
    }
    loadData();
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getAllBookings();
      const bookings = response.data || [];
      const total = bookings.length;
      const pending = bookings.filter(b => b.status === 'PENDING').length;
      const approved = bookings.filter(b => b.status === 'APPROVED').length;
      const rejected = bookings.filter(b => b.status === 'REJECTED').length;
      setStats({ total, pending, approved, rejected });

      const sorted = [...bookings].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setRecentBookings(sorted.slice(0, 5));
    } catch (err) {
      setError('Failed to load dashboard data');
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  };

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      <div className="admin-header">
        <h1>Booking Admin Dashboard</h1>
        <p>Welcome back, {user?.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <span className="stat-value">{stats.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Bookings</h2>
          <button className="view-all-btn" onClick={() => navigate('/admin/bookings')}>
            Manage All →
          </button>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {recentBookings.length === 0 ? (
          <div className="empty-state">No bookings yet.</div>
        ) : (
          <div className="recent-table-wrapper">
            <table className="recent-table">
              <thead>
                <tr><th>User</th><th>Resource</th><th>Date</th><th>Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentBookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.userEmail}</td>
                    <td>{booking.resourceName}</td>
                    <td>{booking.date}</td>
                    <td>{booking.startTime} – {booking.endTime}</td>
                    <td><span className={`status-badge ${getStatusClass(booking.status)}`}>{booking.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;