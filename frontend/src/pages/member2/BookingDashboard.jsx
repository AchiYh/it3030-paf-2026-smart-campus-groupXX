import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/member2/bookingService';
import './BookingDashboard.css';

function BookingDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getMyBookings(user.email);
      setBookings(response.data || []);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    approved: bookings.filter(b => b.status === 'APPROVED').length,
    rejected: bookings.filter(b => b.status === 'REJECTED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'Lecture Halls': return '🏛️';
      case 'Labs': return '💻';
      case 'Meeting Rooms': return '📚';
      case 'Equipment': return '📹';
      default: return '📦';
    }
  };

  const firstName = user?.email?.split('@')[0] || 'User';

  return (
    <div className="bdb-container">
      {/* Hero Welcome with Total on the right */}
      <div className="bdb-hero">
        <div className="bdb-hero-text">
          <p className="bdb-greeting">Good day,</p>
          <h1 className="bdb-title">{firstName} 👋</h1>
          <p className="bdb-subtitle">Manage your campus resource bookings from one place.</p>
        </div>
        <div className="bdb-hero-total">
          <div className="bdb-total-stat">
            <div className="bdb-total-value">{loading ? '—' : stats.total}</div>
            <div className="bdb-total-label">Total Bookings</div>
          </div>
          <div className="bdb-role-tag">{user?.role || 'USER'}</div>
        </div>
      </div>

      {/* Stats Row: Pending, Approved, Rejected, Cancelled */}
      <div className="bdb-stats">
        <div className="bdb-stat-card bdb-stat-pending">
          <div className="bdb-stat-icon">⏳</div>
          <div className="bdb-stat-info">
            <span className="bdb-stat-value">{loading ? '—' : stats.pending}</span>
            <span className="bdb-stat-label">Pending</span>
          </div>
        </div>
        <div className="bdb-stat-card bdb-stat-approved">
          <div className="bdb-stat-icon">✅</div>
          <div className="bdb-stat-info">
            <span className="bdb-stat-value">{loading ? '—' : stats.approved}</span>
            <span className="bdb-stat-label">Approved</span>
          </div>
        </div>
        <div className="bdb-stat-card bdb-stat-rejected">
          <div className="bdb-stat-icon">❌</div>
          <div className="bdb-stat-info">
            <span className="bdb-stat-value">{loading ? '—' : stats.rejected}</span>
            <span className="bdb-stat-label">Rejected</span>
          </div>
        </div>
        <div className="bdb-stat-card bdb-stat-cancelled">
          <div className="bdb-stat-icon">🚫</div>
          <div className="bdb-stat-info">
            <span className="bdb-stat-value">{loading ? '—' : stats.cancelled}</span>
            <span className="bdb-stat-label">Cancelled</span>
          </div>
        </div>
      </div>

      {/* CTA Actions (unchanged) */}
      <div className="bdb-actions">
        <button className="bdb-cta bdb-cta-primary" onClick={() => navigate('/bookings/find')}>
          <span className="bdb-cta-icon">➕</span>
          <div>
            <div className="bdb-cta-title">Book Now</div>
            <div className="bdb-cta-desc">Find and reserve a campus resource</div>
          </div>
          <span className="bdb-cta-arrow">→</span>
        </button>

        <button className="bdb-cta bdb-cta-secondary" onClick={() => navigate('/bookings/my')}>
          <span className="bdb-cta-icon">📋</span>
          <div>
            <div className="bdb-cta-title">My Bookings</div>
            <div className="bdb-cta-desc">View and manage all your bookings</div>
          </div>
          <span className="bdb-cta-arrow">→</span>
        </button>

        <button className="bdb-cta bdb-cta-tertiary" onClick={() => navigate('/bookings/find')}>
          <span className="bdb-cta-icon">🔍</span>
          <div>
            <div className="bdb-cta-title">Find Resources</div>
            <div className="bdb-cta-desc">Browse halls, labs & equipment</div>
          </div>
          <span className="bdb-cta-arrow">→</span>
        </button>
      </div>

      {/* Recent Bookings (unchanged) */}
      <div className="bdb-recent">
        <div className="bdb-section-head">
          <h2>🕐 Recent Activity</h2>
          <button className="bdb-view-all" onClick={() => navigate('/bookings/my')}>
            View All →
          </button>
        </div>

        {loading ? (
          <div className="bdb-loading">
            <div className="bdb-skeleton"></div>
            <div className="bdb-skeleton"></div>
            <div className="bdb-skeleton"></div>
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="bdb-empty">
            <div className="bdb-empty-icon">📭</div>
            <p>No bookings yet.</p>
            <button className="bdb-empty-cta" onClick={() => navigate('/bookings/find')}>
              Make your first booking →
            </button>
          </div>
        ) : (
          <div className="bdb-recent-list">
            {recentBookings.map(booking => (
              <div key={booking.id} className="bdb-recent-card">
                <div className="bdb-recent-icon">
                  {getResourceIcon(booking.resourceType)}
                </div>
                <div className="bdb-recent-info">
                  <div className="bdb-recent-name">{booking.resourceName}</div>
                  <div className="bdb-recent-meta">
                    📅 {booking.date} &nbsp;·&nbsp; 🕐 {booking.startTime} – {booking.endTime}
                  </div>
                  <div className="bdb-recent-purpose">{booking.purpose}</div>
                </div>
                <span className={`bdb-status-badge ${getStatusClass(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingDashboard;