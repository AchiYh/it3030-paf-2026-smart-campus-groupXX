import BookingStatusBadge from './BookingStatusBadge';

function BookingCard({ booking, onCancel }) {
  return (
    <div style={{
      border: '1px solid #d1d5db',
      borderRadius: '16px',
      padding: '1.25rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
      background: '#ffffff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{booking.resourceName}</h3>
          <p style={{ margin: '0.25rem 0 0', color: '#475569' }}>
            {booking.date} · {booking.startTime} - {booking.endTime}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
        <div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Booked by</p>
          <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{booking.userEmail}</p>
        </div>
        <div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Attendees</p>
          <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{booking.attendees}</p>
        </div>
        <div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Purpose</p>
          <p style={{ margin: '0.25rem 0 0', wordBreak: 'break-word' }}>{booking.purpose}</p>
        </div>
      </div>

      {booking.rejectReason && (
        <p style={{ marginTop: '1rem', color: '#991b1b', fontWeight: 600 }}>
          Rejection note: {booking.rejectReason}
        </p>
      )}

      {booking.status === 'APPROVED' && (
        <button
          onClick={() => onCancel(booking.id)}
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            borderRadius: '9999px',
            border: 'none',
            background: '#ef4444',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Cancel Booking
        </button>
      )}
    </div>
  );
}

export default BookingCard;
