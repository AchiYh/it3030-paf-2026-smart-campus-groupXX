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

  // Helper to get the best available date for processing
  const getBestAvailableDate = (booking) => {
    if (!booking) return null;
    
    // For APPROVED or REJECTED bookings, use updatedAt if available and different from createdAt
    // This gives us the approval/rejection timestamp
    if (booking.status !== 'PENDING') {
      if (booking.updatedAt) {
        return booking.updatedAt;
      }
    }
    // Fallback to createdAt
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
        // Store the best available date for sorting and display
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
  
  // Sort bookings - most recently processed/created first
  const sorted = [...filteredBookings].sort((a, b) => {
    let dateA = a.effectiveDate ? new Date(a.effectiveDate) : new Date(0);
    let dateB = b.effectiveDate ? new Date(b.effectiveDate) : new Date(0);
    
    // Handle invalid dates
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
    <div className="dashboard-content-only">
      {toast.show && (
        <div className={`manage-toast ${toast.type}`} style={{ zIndex: 2000 }}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.message}
        </div>
      )}

      <section className="command-banner">
          <div className="command-info">
            <div className="welcome-tag">SYSTEM ADMINISTRATION</div>
            <h2>Booking Admin Dashboard</h2>
            <div className="command-status">
                <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>CAMPUS OVERVIEW</span>
                <span style={{ background: '#f9b824', color: '#1a2a44' }}>REAL-TIME TELEMETRY</span>
            </div>
          </div>
          <div className="analyze-summary-widget">
            <div className="summary-stat">
              <span className="summary-label">ACTIVE SESSION</span>
              <span className="summary-value" style={{ fontSize: '0.8rem', color: '#fff' }}>{user?.email}</span>
            </div>
          </div>
      </section>

      {/* Analytics Widgets */}
      <div className="stats-row" style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <div className="stat-widget" style={{ borderLeft: '4px solid #1a2a44' }}>
          <div className="stat-icon" style={{ background: '#f1f5f9' }}>📊</div>
          <div>
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">TOTAL BOOKINGS</div>
          </div>
        </div>
        <div className="stat-widget" style={{ borderLeft: '4px solid #f9b824' }}>
          <div className="stat-icon" style={{ background: '#fff3d1' }}>⌛</div>
          <div>
            <div className="stat-value">{bookings.filter(b => b.status === 'PENDING').length}</div>
            <div className="stat-label">PENDING</div>
          </div>
        </div>
        <div className="stat-widget" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon" style={{ background: '#dcfce7' }}>✅</div>
          <div>
            <div className="stat-value">{bookings.filter(b => b.status === 'APPROVED').length}</div>
            <div className="stat-label">APPROVED</div>
          </div>
        </div>
        <div className="stat-widget" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-icon" style={{ background: '#fee2e2' }}>❌</div>
          <div>
            <div className="stat-value">{bookings.filter(b => b.status === 'REJECTED').length}</div>
            <div className="stat-label">REJECTED</div>
          </div>
        </div>
      </div>

      <div className="info-card" style={{ marginTop: '32px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Recent Bookings Registry</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: activeTab === tab.key ? '#1a2a44' : '#fff',
                  color: activeTab === tab.key ? '#fff' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="manage-error">⚠️ {error}</div>}

        {loading ? (
          <div className="loading-state">Synchronizing registry...</div>
        ) : sorted.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
            <p style={{ color: '#64748b', fontWeight: 600 }}>No {activeTab.toLowerCase()} bookings found in the registry.</p>
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={thStyle}>USER</th>
                  <th style={thStyle}>RESOURCE</th>
                  <th style={thStyle}>DATE</th>
                  <th style={thStyle}>TIME</th>
                  <th style={thStyle}>STATUS</th>
                  {showActionsColumn && <th style={thStyle}>ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {sorted.map((booking) => (
                  <tr key={booking.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: '#1a2a44' }}>{booking.userEmail}</div>
                    </td>
                    <td style={tdStyle}>{booking.resourceName}</td>
                    <td style={tdStyle}>{booking.date}</td>
                    <td style={tdStyle}>{booking.startTime} – {booking.endTime}</td>
                    <td style={tdStyle}>
                      <span className={`status-badge ${getStatusClass(booking.status)}`} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                        {booking.status}
                      </span>
                    </td>
                    {showActionsColumn && (
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleApproveClick(booking)}
                            style={{ background: '#10b981', color: '#fff', border: 0, padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                          >
                            APPROVE
                          </button>
                          <button 
                            onClick={() => handleRejectClick(booking)}
                            style={{ background: '#ef4444', color: '#fff', border: 0, padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                          >
                            REJECT
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal logic remains same - just wrapped in premium styling */}
      {showConfirmModal && actionBooking && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)} style={{ zIndex: 3000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ borderRadius: '24px', padding: '32px' }}>
            <div className="modal-header" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{isApprove ? '✓ Approve Protocol' : '✗ Reject Protocol'}</h2>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={modalLabelStyle}>RESOURCE</label>
                  <p style={modalValueStyle}>{actionBooking.resourceName}</p>
                </div>
                <div>
                  <label style={modalLabelStyle}>REQUESTOR</label>
                  <p style={modalValueStyle}>{actionBooking.userEmail}</p>
                </div>
              </div>
              {!isApprove && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={modalLabelStyle}>REJECTION REASON *</label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', marginTop: '8px' }}
                    placeholder="Enter official reason..."
                    rows="3"
                  />
                </div>
              )}
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px' }}>CANCEL</button>
              <button
                onClick={isApprove ? confirmApprove : confirmReject}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', background: isApprove ? '#1a2a44' : '#ef4444', color: '#fff', border: 0, fontWeight: 800 }}
              >
                {isApprove ? 'CONFIRM APPROVAL' : 'CONFIRM REJECTION'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '16px', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' };
const tdStyle = { padding: '16px', fontSize: '0.85rem', color: '#475569' };
const modalLabelStyle = { fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' };
const modalValueStyle = { fontSize: '0.9rem', fontWeight: 700, color: '#1a2a44', margin: '4px 0 0 0' };

export default ManageBookings;