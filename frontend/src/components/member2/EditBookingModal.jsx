import { useEffect, useState } from 'react';

function EditBookingModal({ booking, onClose, onUpdate }) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [attendees, setAttendees] = useState(1);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!booking) return;
    setDate(booking.date || '');
    setStartTime(booking.startTime || '');
    setEndTime(booking.endTime || '');
    setPurpose(booking.purpose || '');
    setAttendees(booking.attendees || 1);
    setError(null);
    setSubmitting(false);
  }, [booking]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!date || !startTime || !endTime || !purpose.trim()) {
      setError('Please fill all required fields.');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be later than start time.');
      return;
    }

    if (attendees < 1) {
      setError('Attendees must be at least 1.');
      return;
    }

    setSubmitting(true);
    try {
      await onUpdate(booking.id, {
        resourceId: booking.resourceId,
        resourceName: booking.resourceName,
        userEmail: booking.userEmail,
        date,
        startTime,
        endTime,
        purpose: purpose.trim(),
        attendees,
      });
    } catch (updateError) {
      setError(updateError.message || 'Unable to update booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1.5rem',
      zIndex: 1000,
    }}>
      <div style={{
        width: 'min(760px, 100%)',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '1.75rem',
        boxShadow: '0 30px 80px rgba(15, 23, 42, 0.18)',
        maxHeight: 'calc(100vh - 3rem)',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Edit Booking</h2>
            <p style={{ margin: '0.5rem 0 0', color: '#475569' }}>
              Update the date, time, purpose, or attendee count for your pending booking.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '1.25rem',
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            <label style={{ display: 'grid', gap: '0.5rem', color: '#0f172a' }}>
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ padding: '0.85rem', borderRadius: '0.9rem', border: '1px solid #cbd5e1', width: '100%' }}
              />
            </label>
            <label style={{ display: 'grid', gap: '0.5rem', color: '#0f172a' }}>
              Start Time
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ padding: '0.85rem', borderRadius: '0.9rem', border: '1px solid #cbd5e1', width: '100%' }}
              />
            </label>
            <label style={{ display: 'grid', gap: '0.5rem', color: '#0f172a' }}>
              End Time
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ padding: '0.85rem', borderRadius: '0.9rem', border: '1px solid #cbd5e1', width: '100%' }}
              />
            </label>
            <label style={{ display: 'grid', gap: '0.5rem', color: '#0f172a' }}>
              Attendees
              <input
                type="number"
                min={1}
                value={attendees}
                onChange={(e) => setAttendees(Number(e.target.value))}
                style={{ padding: '0.85rem', borderRadius: '0.9rem', border: '1px solid #cbd5e1', width: '100%' }}
              />
            </label>
          </div>

          <label style={{ display: 'grid', gap: '0.5rem', color: '#0f172a' }}>
            Purpose
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={4}
              style={{ padding: '0.85rem', borderRadius: '0.9rem', border: '1px solid #cbd5e1', width: '100%', resize: 'vertical' }}
              placeholder="Update the reason for your booking"
            />
          </label>

          {error && (
            <div style={{ padding: '1rem', borderRadius: '0.85rem', background: '#fee2e2', color: '#991b1b' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.85rem 1.2rem', borderRadius: '9999px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.85rem 1.4rem',
                borderRadius: '9999px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBookingModal;
