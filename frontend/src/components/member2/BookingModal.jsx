import { useState } from 'react';

function BookingModal({ resource, userEmail, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    resourceId: resource?.id || '',
    resourceName: resource?.name || '',
    resourceType: resource?.type || '',
    userEmail: userEmail || '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1,
    quantity: 1
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const isEquipment = resource?.type === 'Equipment';
  const maxQuantity = isEquipment ? resource?.availableCount : resource?.capacity;
  const quantityLabel = isEquipment ? 'Quantity' : 'Attendees';

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

    const valueToCheck = isEquipment ? formData.quantity : formData.attendees;
    if (valueToCheck > maxQuantity) {
      setModalError(`${quantityLabel} cannot exceed ${maxQuantity}`);
      setSubmitting(false);
      return;
    }

    try {
      const bookingData = {
        resourceId: formData.resourceId,
        resourceName: formData.resourceName,
        resourceType: formData.resourceType,
        userEmail: formData.userEmail,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        attendees: isEquipment ? formData.quantity : formData.attendees,
        quantity: isEquipment ? formData.quantity : 1
      };
      await onCreate(bookingData);
    } catch (err) {
      setModalError(err.message || 'Failed to create booking');
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
          <div className="modal-info-section">
            <div className="modal-info-row">
              <div className="modal-info-field">
                <label>📍 Location</label>
                <div className="info-value">{resource?.location || 'Not specified'}</div>
              </div>
              <div className="modal-info-field">
                <label>{isEquipment ? '📊 Available' : '👥 Max Capacity'}</label>
                <div className="info-value">
                  {isEquipment 
                    ? `${resource?.availableCount} out of ${resource?.totalCount}` 
                    : `${resource?.capacity} people`}
                </div>
              </div>
            </div>
            {resource?.roomNumber && (
              <div className="modal-info-row" style={{ marginTop: '0.5rem' }}>
                <div className="modal-info-field">
                  <label>🏠 Room Number</label>
                  <div className="info-value">{resource.roomNumber}</div>
                </div>
              </div>
            )}
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
            <label>{quantityLabel} *</label>
            <input
              type="number"
              name={isEquipment ? 'quantity' : 'attendees'}
              value={isEquipment ? formData.quantity : formData.attendees}
              onChange={handleChange}
              min="1"
              max={maxQuantity}
              required
            />
            {isEquipment && resource?.availableCount <= 3 && resource?.availableCount > 0 && (
              <div className="field-warning">⚠️ Only {resource?.availableCount} items left in stock!</div>
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