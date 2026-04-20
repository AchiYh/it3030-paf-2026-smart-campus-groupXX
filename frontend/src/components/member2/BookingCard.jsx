import React, { useState } from 'react';
import bookingService from '../../services/member2/bookingService';

const statusConfig = {
  PENDING: { class: 'status-pending', label: 'PENDING' },
  APPROVED: { class: 'status-approved', label: 'APPROVED' },
  REJECTED: { class: 'status-rejected', label: 'REJECTED' },
  CANCELLED: { class: 'status-cancelled', label: 'CANCELLED' }
};

function BookingCard({ booking, isOwner, onEdit, onDelete, onRefresh, setSuccessMessage, setError }) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const status = statusConfig[booking.status] || statusConfig.PENDING;

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }
    setSubmitting(true);
    try {
      await bookingService.cancelBooking(booking.id);
      setSuccessMessage('Booking cancelled successfully');
      onRefresh();
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="booking-card">
        <div className="booking-header">
          <h3>{booking.resourceName}</h3>
          <span className={`status-badge ${status.class}`}>{status.label}</span>
        </div>
        
        <div className="booking-details">
          <p>📅 {booking.date} | 🕐 {booking.startTime} - {booking.endTime}</p>
          <p>👥 Attendees: {booking.attendees}</p>
          <p>📝 {booking.purpose}</p>
          {booking.rejectReason && (
            <p className="reject-reason">❌ Rejection reason: {booking.rejectReason}</p>
          )}
        </div>

        {isOwner && booking.status === 'PENDING' && (
          <div className="booking-actions">
            <button className="edit-btn" onClick={() => onEdit(booking)}>✏️ Edit</button>
            <button className="delete-btn" onClick={() => onDelete(booking.id)}>🗑️ Delete</button>
          </div>
        )}

        {isOwner && booking.status === 'APPROVED' && (
          <div className="booking-actions">
            <button className="cancel-btn" onClick={() => setShowCancelModal(true)}>❌ Cancel</button>
          </div>
        )}
      </div>

      {/* Cancel Reason Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cancel Booking</h2>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>✕</button>
            </div>
            <div className="modal-field">
              <label>Reason for cancellation *</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows="3"
                placeholder="Please explain why you are cancelling this booking..."
                required
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCancelModal(false)}>Back</button>
              <button className="btn-primary" onClick={handleCancelConfirm} disabled={submitting}>
                {submitting ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BookingCard;