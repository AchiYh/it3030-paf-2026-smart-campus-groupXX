import './BookingCard.css';

const TYPE_ICONS = {
  'Lecture Halls': '🏛️',
  'Labs': '💻',
  'Meeting Rooms': '📚',
  'Equipment': '📹',
};

function BookingCard({ booking, isOwner, onEdit, onCancel, onDelete }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':   return 'bc-status-pending';
      case 'APPROVED':  return 'bc-status-approved';
      case 'REJECTED':  return 'bc-status-rejected';
      case 'CANCELLED': return 'bc-status-cancelled';
      default: return '';
    }
  };

  const icon = TYPE_ICONS[booking.resourceType] || '📦';
  const canEdit   = isOwner && booking.status === 'PENDING';
  const canCancel = isOwner && booking.status === 'APPROVED';
  const canDelete = isOwner && booking.status === 'PENDING';

  return (
    <div className="bc-card">
      <div className="bc-left">
        <div className="bc-icon-wrap">{icon}</div>
      </div>

      <div className="bc-body">
        <div className="bc-top">
          <div>
            <h3 className="bc-name">{booking.resourceName}</h3>
            <p className="bc-type">{booking.resourceType}</p>
          </div>
          <span className={`bc-status ${getStatusClass(booking.status)}`}>
            {booking.status}
          </span>
        </div>

        <div className="bc-details">
          <div className="bc-detail-item">
            <span className="bc-detail-icon">📅</span>
            <span>{booking.date}</span>
          </div>
          <div className="bc-detail-item">
            <span className="bc-detail-icon">🕐</span>
            <span>{booking.startTime} – {booking.endTime}</span>
          </div>
          {booking.attendees && (
            <div className="bc-detail-item">
              <span className="bc-detail-icon">👥</span>
              <span>
                {booking.resourceType === 'Equipment'
                  ? `Qty: ${booking.attendees}`
                  : `${booking.attendees} attendees`}
              </span>
            </div>
          )}
          {booking.purpose && (
            <div className="bc-detail-item bc-purpose">
              <span className="bc-detail-icon">📝</span>
              <span>{booking.purpose}</span>
            </div>
          )}
          {booking.rejectReason && (
            <div className="bc-rejection">
              ❌ Reason: {booking.rejectReason}
            </div>
          )}
        </div>

        {(canEdit || canCancel || canDelete) && (
          <div className="bc-actions">
            {canEdit && (
              <button className="bc-btn bc-btn-edit" onClick={() => onEdit(booking)}>
                ✏️ Edit
              </button>
            )}
            {canDelete && (
              <button className="bc-btn bc-btn-delete" onClick={() => onDelete(booking.id)}>
                🗑️ Delete
              </button>
            )}
            {canCancel && (
              <button className="bc-btn bc-btn-cancel" onClick={() => onCancel(booking.id)}>
                🚫 Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingCard;