import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/member2/bookingService';
import './ManageBookings.css';

function ManageBookings() {
  const { user } = useAuth();
  const navigate = useNavigate(); // Add navigate hook
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [actionBooking, setActionBooking] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [conflictError, setConflictError] = useState(null);
  const [viewingRejection, setViewingRejection] = useState(null);

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

  const getRejectionReason = (booking) => {
    if (!booking) return null;
    return booking.rejectReason || booking.rejectionReason || null;
  };

  const getBestAvailableDate = (booking) => {
    if (!booking) return null;
    if (booking.status !== 'PENDING') {
      if (booking.updatedAt) {
        return booking.updatedAt;
      }
    }
    return booking.createdAt || null;
  };

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getAllBookings();
      console.log('=== RAW API RESPONSE ===');
      console.log(response.data);
      
      const processedBookings = (response.data || []).map(booking => ({
        ...booking,
        rejectReason: booking.rejectReason || null,
        effectiveDate: getBestAvailableDate(booking)
      }));
      
      console.log('=== PROCESSED BOOKINGS WITH DATES ===');
      processedBookings.forEach(booking => {
        console.log(`Booking ${booking.id}:`, {
          status: booking.status,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          effectiveDate: booking.effectiveDate,
        });
      });
      
      setBookings(processedBookings);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Failed to load bookings');
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => b.status === activeTab);
  
  const sorted = [...filteredBookings].sort((a, b) => {
    let dateA = a.effectiveDate ? new Date(a.effectiveDate) : new Date(0);
    let dateB = b.effectiveDate ? new Date(b.effectiveDate) : new Date(0);
    if (isNaN(dateA.getTime())) dateA = new Date(0);
    if (isNaN(dateB.getTime())) dateB = new Date(0);
    return dateB - dateA;
  });

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
      const response = await bookingService.approveBooking(actionBooking.id);
      console.log('✅ Approval response:', response.data);
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
      console.log('📤 Sending rejection:', {
        bookingId: actionBooking.id,
        reason: rejectReason.trim()
      });
      
      const response = await bookingService.rejectBooking(actionBooking.id, rejectReason.trim());
      console.log('❌ Rejection response:', response.data);
      showToast(`Booking "${actionBooking.resourceName}" rejected.`, 'info');
      await loadBookings();
      setShowConfirmModal(false);
      setActionBooking(null);
      setActionType(null);
      setRejectReason('');
    } catch (err) {
      console.error('❌ Rejection error:', err);
      showToast(err.response?.data?.message || 'Rejection failed', 'error');
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

  const truncateReason = (reason, maxLength = 50) => {
    if (!reason) return '—';
    if (reason.length <= maxLength) return reason;
    return reason.substring(0, maxLength) + '...';
  };

  const showActionsColumn = activeTab === 'PENDING';

  const handleViewRejectionDetails = (booking) => {
    const reason = getRejectionReason(booking);
    setViewingRejection({
      id: booking.id,
      resourceName: booking.resourceName,
      userEmail: booking.userEmail,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose,
      reason: reason || 'No specific reason provided.',
      rejectedAt: booking.updatedAt || booking.createdAt
    });
  };

  const closeRejectionModal = () => {
    setViewingRejection(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayProcessedDate = (booking) => {
    if (activeTab !== 'PENDING' && booking.effectiveDate) {
      return formatDate(booking.effectiveDate);
    }
    return null;
  };

  return (
    <div className="manage-container">
      {toast.show && (
        <div className={`manage-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.message}
        </div>
      )}

      <div className="manage-header">
        <div className="manage-header-left">
          <h1>📋 Manage Bookings</h1>
          <p>Review, approve, or reject booking requests</p>
        </div>
        <div className="manage-header-right">
          <button 
            className="dashboard-btn" 
            onClick={() => navigate('/admin/bookings-dashboard')}
            title="Go to Booking Dashboard"
          >
            📊 Dashboard
          </button>
        </div>
      </div>

      {error && <div className="manage-error">⚠️ {error}</div>}

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
                {activeTab === 'REJECTED' && <th>Rejection Reason</th>}
                {activeTab !== 'PENDING' && <th>Processed On</th>}
                {showActionsColumn && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sorted.map((booking, index) => {
                const rejectionReason = getRejectionReason(booking);
                const displayDate = getDisplayProcessedDate(booking);
                const isMostRecent = index === 0 && activeTab !== 'PENDING';
                
                return (
                  <tr key={booking.id} className={isMostRecent ? 'most-recent-row' : ''}>
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
                    {activeTab === 'REJECTED' && (
                      <td 
                        className="rejection-reason-cell" 
                        title={rejectionReason || 'No reason provided'}
                      >
                        {rejectionReason ? (
                          <div className="rejection-reason-display">
                            <span className="rejection-icon">❌</span>
                            <span className="rejection-reason-text">{truncateReason(rejectionReason)}</span>
                            <button 
                              className="view-full-reason-btn"
                              onClick={() => handleViewRejectionDetails(booking)}
                            >
                              View Full
                            </button>
                          </div>
                        ) : (
                          <span className="no-reason">—</span>
                        )}
                      </td>
                    )}
                    {activeTab !== 'PENDING' && (
                      <td className="processed-date-cell" title={booking.effectiveDate}>
                        {displayDate}
                      </td>
                    )}
                    {showActionsColumn && (
                      <td className="actions-cell">
                        <button className="approve-btn" onClick={() => handleApproveClick(booking)}>
                          ✅ Approve
                        </button>
                        <button className="reject-btn" onClick={() => handleRejectClick(booking)}>
                          ❌ Reject
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal for Approve/Reject */}
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
                    autoFocus
                  />
                  <small style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '0.25rem', display: 'block' }}>
                    This reason will be visible to the user.
                  </small>
                </div>
              )}
              
              {isApprove && (
                <div className="conflict-warning">
                  ⚠️ The system will check for time conflicts with existing approved bookings before approving.
                </div>
              )}
              
              {conflictError && (
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

      {/* View Full Rejection Reason Modal */}
      {viewingRejection && (
        <div className="modal-overlay" onClick={closeRejectionModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>❌ Rejection Details</h2>
              <button className="modal-close" onClick={closeRejectionModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label>Resource</label>
                <p><strong>{viewingRejection.resourceName}</strong></p>
              </div>
              <div className="modal-field">
                <label>User</label>
                <p>{viewingRejection.userEmail}</p>
              </div>
              <div className="modal-field">
                <label>Date & Time</label>
                <p>{viewingRejection.date} | {viewingRejection.startTime} – {viewingRejection.endTime}</p>
              </div>
              <div className="modal-field">
                <label>Purpose</label>
                <p>{viewingRejection.purpose}</p>
              </div>
              <div className="modal-field">
                <label>Rejection Reason</label>
                <div className="rejection-reason-box">
                  {viewingRejection.reason}
                </div>
              </div>
              {viewingRejection.rejectedAt && (
                <div className="modal-field">
                  <label>Rejected On</label>
                  <p>{formatDate(viewingRejection.rejectedAt)}</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={closeRejectionModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageBookings;