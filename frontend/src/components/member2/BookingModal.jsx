import { useState } from 'react';
import bookingService from '../../services/member2/bookingService';

function BookingModal({ resource, userEmail, onClose, onBookingSuccess, setSuccessMessage, setError }) {
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
  const [modalError, setModalError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setModalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    if (formData.startTime >= formData.endTime) {
      setModalError('End time must be after start time');
      setSubmitting(false);
      return;
    }

    if (formData.attendees > resource.capacity) {
      setModalError(`Attendees cannot exceed room capacity (${resource.capacity})`);
      setSubmitting(false);
      return;
    }

    try {
      await bookingService.createBooking(formData);
      setSuccessMessage('Booking request created successfully!');
      onBookingSuccess();
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create booking';
      setModalError(message);
      setError(message);
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
          {/* READ-ONLY INFO SECTION - Location and Capacity */}
          <div className="modal-info-section">
            <div className="modal-info-row">
              <div className="modal-info-field">
                <label>📍 Location</label>
                <div className="info-value">{resource?.location || 'Not specified'}</div>
              </div>
              <div className="modal-info-field">
                <label>👥 Max Capacity</label>
                <div className="info-value">{resource?.capacity || 0} people</div>
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
              max={resource?.capacity || 1000}
              required
            />
            {formData.attendees > (resource?.capacity || 0) && (
              <div className="field-warning">⚠️ Attendees exceed room capacity ({resource?.capacity})</div>
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
              placeholder="Describe the purpose of this booking..."
            />
          </div>

          {modalError && <div className="modal-error">{modalError}</div>}

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