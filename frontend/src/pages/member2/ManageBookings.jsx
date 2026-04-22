import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/member2/bookingService';
import './ManageBookings.css';

function ManageBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [actionBooking, setActionBooking] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [rejectReason, setRejectReason] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [conflictError, setConflictError] = useState(null);

  const tabs = [
    { key: 'PENDING', label: 'Pending', icon: '⏳' },
    { key: 'APPROVED', label: 'Approved', icon: '✅' },
    { key: 'REJECTED', label: 'Rejected', icon: '❌' },
  ];

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    loadBookings();
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getAllBookings();
      setBookings(response.data || []);
    } catch (err) {
      setError('Failed to load bookings');
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => b.status === activeTab);
  const sorted = [...filteredBookings].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const handleApproveClick = (booking) => {
    setActionBooking(booking);
    setActionType('approve');
    setRejectReason('');
    setConflictError(null);
    setShowConfirmModal(true);
  };

  const handleRejectClick = (booking) => {
    setActionBooking(booking);
    setActionType('reject');
    setRejectReason('');
    setConflictError(null);
    setShowConfirmModal(true);
  };

  const confirmApprove = async () => {
    if (!actionBooking) return;
    try {
      await bookingService.approveBooking(actionBooking.id);
      showToast(`Booking "${actionBooking.resourceName}" approved successfully!`, 'success');
      await loadBookings();
      setShowConfirmModal(false);
      setActionBooking(null);
      setActionType(null);
    } catch (err) {
      const conflictMsg = err.response?.data?.message || 'Approval failed due to conflict';
      setConflictError(conflictMsg);
      showToast(conflictMsg, 'error');
    }
  };

  const confirmReject = async () => {
    if (!actionBooking) return;
    if (!rejectReason.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }
    try {
      await bookingService.rejectBooking(actionBooking.id, rejectReason);
      showToast(`Booking "${actionBooking.resourceName}" rejected.`, 'info');
      await loadBookings();
      setShowConfirmModal(false);
      setActionBooking(null);
      setActionType(null);
      setRejectReason('');
    } catch (err) {
      showToast('Rejection failed', 'error');
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

  const isApprove = actionType === 'approve';

  return (
    <div className="manage-container">
      {/* Toast */}
      {toast.show && (
        <div className={`manage-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.message}
        </div>
      )}

      <div className="manage-header">
        <h1>📋 Manage Bookings</h1>
        <p>Review, approve, or reject booking requests</p>
      </div>

      {error && <div className="manage-error">⚠️ {error}</div>}

      {/* Tabs */}
      <div className="manage-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label} ({bookings.filter(b => b.status === tab.key).length})
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-skeleton">
          <div className="skeleton-spinner"></div>
          <p>Loading bookings...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No {activeTab.toLowerCase()} bookings found.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Resource</th>
                <th>Date</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(booking => (
                <tr key={booking.id}>
                  <td className="user-email">{booking.userEmail}</td>
                  <td className="resource-name">{booking.resourceName}</td>
                  <td>{booking.date}</td>
                  <td>{booking.startTime} – {booking.endTime}</td>
                  <td className="purpose-cell" title={booking.purpose}>{booking.purpose}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {booking.status === 'PENDING' && (
                      <>
                        <button className="approve-btn" onClick={() => handleApproveClick(booking)}>
                          ✅ Approve
                        </button>
                        <button className="reject-btn" onClick={() => handleRejectClick(booking)}>
                          ❌ Reject
                        </button>
                      </>
                    )}
                    {booking.status !== 'PENDING' && <span className="no-action">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && actionBooking && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isApprove ? '✓ Approve Booking' : '✗ Reject Booking'}</h2>
              <button className="modal-close" onClick={() => setShowConfirmModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label>Resource</label>
                <p><strong>{actionBooking.resourceName}</strong></p>
              </div>
              <div className="modal-field">
                <label>User</label>
                <p>{actionBooking.userEmail}</p>
              </div>
              <div className="modal-field">
                <label>Date & Time</label>
                <p>{actionBooking.date} | {actionBooking.startTime} – {actionBooking.endTime}</p>
              </div>
              <div className="modal-field">
                <label>Purpose</label>
                <p>{actionBooking.purpose}</p>
              </div>
              
              {!isApprove && (
                <div className="modal-field">
                  <label>Reason for rejection *</label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    rows="3"
                    placeholder="Please provide a reason for rejecting this booking..."
                  />
                </div>
              )}
              
              {isApprove && (
                <div className="conflict-warning">
                  ⚠️ The system will check for time conflicts with existing approved bookings before approving.
                </div>
              )}
              
              {conflictError && !isApprove && (
                <div className="conflict-warning" style={{ background: '#fee2e2', color: '#991b1b', borderLeftColor: '#ef4444' }}>
                  ❌ {conflictError}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button
                className={isApprove ? 'btn-primary' : 'btn-danger'}
                onClick={isApprove ? confirmApprove : confirmReject}
                disabled={!isApprove && !rejectReason.trim()}
              >
                {isApprove ? '✓ Confirm Approval' : '✗ Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageBookings;