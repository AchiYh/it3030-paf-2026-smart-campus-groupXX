import { useState } from 'react';

const RESOURCE_OPTIONS = [
  { id: 'res-101', name: 'Lecture Hall A' },
  { id: 'res-102', name: 'Computer Lab B' },
  { id: 'res-103', name: 'Meeting Room 1' },
  { id: 'res-104', name: 'Auditorium' },
];

function BookingForm({ defaultEmail, onCreate }) {
  const [resourceId, setResourceId] = useState(RESOURCE_OPTIONS[0].id);
  const [resourceName, setResourceName] = useState(RESOURCE_OPTIONS[0].name);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [attendees, setAttendees] = useState(1);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleResourceChange = (event) => {
    const selectedId = event.target.value;
    const selectedResource = RESOURCE_OPTIONS.find((item) => item.id === selectedId);
    setResourceId(selectedId);
    setResourceName(selectedResource?.name || '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!date || !startTime || !endTime || !purpose) {
      setError('Please complete all required fields.');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be later than start time.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        resourceId,
        resourceName,
        userEmail: defaultEmail,
        date,
        startTime,
        endTime,
        purpose,
        attendees,
      });
      setPurpose('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setAttendees(1);
    } catch (createError) {
      setError(createError?.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Create a Booking</h2>
        <p style={{ margin: 0, color: '#64748b' }}>Reserve a resource for your session.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '1.25rem', display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label style={{ display: 'block' }}>
            Resource
            <select value={resourceId} onChange={handleResourceChange} style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}>
              {RESOURCE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'block' }}>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label style={{ display: 'block' }}>
            Start Time
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}
            />
          </label>

          <label style={{ display: 'block' }}>
            End Time
            <input
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}
            />
          </label>
        </div>

        <label style={{ display: 'block' }}>
          Purpose
          <textarea
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            rows={4}
            placeholder="Enter the reason for this booking"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', resize: 'vertical' }}
          />
        </label>

        <label style={{ display: 'block', maxWidth: '240px' }}>
          Attendees
          <input
            type="number"
            min={1}
            value={attendees}
            onChange={(event) => setAttendees(Number(event.target.value))}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}
          />
        </label>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#fee2e2', color: '#991b1b' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.95rem 1.5rem',
            borderRadius: '9999px',
            border: 'none',
            background: '#4f46e5',
            color: '#ffffff',
            fontWeight: 700,
            cursor: 'pointer',
            width: 'fit-content',
          }}
        >
          {submitting ? 'Creating...' : 'Create Booking'}
        </button>
      </form>
    </section>
  );
}

export default BookingForm;
