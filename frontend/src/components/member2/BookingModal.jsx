import { useState } from 'react';

function BookingModal({ resource, userEmail, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    resourceId: resource?.id || '',
    resourceName: resource?.name || '',
    userEmail: userEmail || '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      setSubmitting(false);
      return;
    }

    if (resource && formData.attendees > resource.capacity) {
      setError(`Attendees cannot exceed room capacity (${resource.capacity})`);
      setSubmitting(false);
      return;
    }

    try {
      await onCreate(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📅 Book {resource?.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>📍 Location</label>
            <input type="text" value={resource?.location || ''} disabled className="disabled-input" />
          </div>

          <div className="modal-field">
            <label>👥 Capacity</label>
            <input type="text" value={resource?.capacity ? `${resource.capacity} people` : ''} disabled className="disabled-input" />
          </div>

          <div className="modal-field">
            <label>📅 Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={today}
            />
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label>🕐 Start Time *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="modal-field">
              <label>🕐 End Time *</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-field">
            <label>👥 Attendees *</label>
            <input
              type="number"
              name="attendees"
              value={formData.attendees}
              onChange={handleChange}
              min="1"
              max={resource?.capacity || 1000}
              required
            />
          </div>

          <div className="modal-field">
            <label>📝 Purpose *</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Describe the purpose of this booking..."
            />
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;