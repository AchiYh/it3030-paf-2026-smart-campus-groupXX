import { useState } from 'react';

function EditBookingModal({ booking, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    resourceId: booking.resourceId,
    resourceName: booking.resourceName,
    userEmail: booking.userEmail,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    purpose: booking.purpose,
    attendees: booking.attendees
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Find resource details - you may need to pass resources as prop or fetch
  // For now, using booking data or you can pass resources from parent
  const resourceLocation = booking.resourceLocation || 'Main Building';
  const resourceCapacity = booking.resourceCapacity || 2500;

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

    try {
      await onUpdate(booking.id, formData);
    } catch (err) {
      setError(err.message || 'Failed to update booking');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Edit Booking - {booking.resourceName}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* READ-ONLY INFO SECTION - Location and Capacity */}
          <div className="modal-info-section">
            <div className="modal-info-row">
              <div className="modal-info-field">
                <label>📍 Location</label>
                <div className="info-value">{resourceLocation}</div>
              </div>
              <div className="modal-info-field">
                <label>👥 Max Capacity</label>
                <div className="info-value">{resourceCapacity} people</div>
              </div>
            </div>
          </div>

          {/* EDITABLE FIELDS */}
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
              max={resourceCapacity}
              required
            />
            {formData.attendees > resourceCapacity && (
              <div className="field-warning">⚠️ Attendees exceed room capacity ({resourceCapacity})</div>
            )}
          </div>

          <div className="modal-field">
            <label>📝 Purpose *</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              rows="3"
            />
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBookingModal;