import { useState } from 'react';
import './BookingModal.css';

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
  const quantityLabel = isEquipment ? 'Quantity Needed' : 'Attendees';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setModalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    if (formData.startTime >= formData.endTime) {
      setModalError('End time must be after start time.');
      setSubmitting(false);
      return;
    }

    const valueToCheck = isEquipment ? formData.quantity : formData.attendees;
    if (valueToCheck > maxQuantity) {
      setModalError(`${quantityLabel} cannot exceed ${maxQuantity}.`);
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
      setModalError(err.message || 'Failed to create booking.');
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const TYPE_ICONS = {
    'Lecture Halls': '🏛️',
    'Labs': '💻',
    'Meeting Rooms': '📚',
    'Equipment': '📹',
  };

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bm-header">
          <div className="bm-header-icon">{TYPE_ICONS[resource?.type] || '📅'}</div>
          <div>
            <h2 className="bm-header-title">Book {resource?.name}</h2>
            <p className="bm-header-sub">{resource?.type} · {resource?.location}</p>
          </div>
          <button className="bm-close" onClick={onClose}>✕</button>
        </div>

        {/* Resource Info Strip */}
        <div className="bm-info-strip">
          {resource?.roomNumber && (
            <div className="bm-info-item">
              <span className="bm-info-label">Room</span>
              <span className="bm-info-value">{resource.roomNumber}</span>
            </div>
          )}
          <div className="bm-info-item">
            <span className="bm-info-label">📍 Location</span>
            <span className="bm-info-value">{resource?.location || '—'}</span>
          </div>
          <div className="bm-info-item">
            <span className="bm-info-label">
              {isEquipment ? '📊 Available' : '👥 Capacity'}
            </span>
            <span className="bm-info-value">
              {isEquipment
                ? `${resource?.availableCount} / ${resource?.totalCount}`
                : `${resource?.capacity?.toLocaleString()} people`}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bm-form">
          {/* Date */}
          <div className="bm-field">
            <label className="bm-label">📅 Date <span className="bm-req">*</span></label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={today}
              className="bm-input"
            />
          </div>

          {/* Time Row */}
          <div className="bm-row">
            <div className="bm-field">
              <label className="bm-label">🕐 Start Time <span className="bm-req">*</span></label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="bm-input"
              />
            </div>
            <div className="bm-field">
              <label className="bm-label">🕐 End Time <span className="bm-req">*</span></label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="bm-input"
              />
            </div>
          </div>

          {/* Attendees / Quantity */}
          <div className="bm-field">
            <label className="bm-label">
              {isEquipment ? '📦' : '👥'} {quantityLabel} <span className="bm-req">*</span>
              <span className="bm-max-hint">Max: {maxQuantity}</span>
            </label>
            <input
              type="number"
              name={isEquipment ? 'quantity' : 'attendees'}
              value={isEquipment ? formData.quantity : formData.attendees}
              onChange={handleChange}
              min="1"
              max={maxQuantity}
              required
              className="bm-input"
            />
            {isEquipment && resource?.availableCount <= 3 && resource?.availableCount > 0 && (
              <p className="bm-warn">⚠️ Only {resource?.availableCount} items left in stock!</p>
            )}
          </div>

          {/* Purpose */}
          <div className="bm-field">
            <label className="bm-label">📝 Purpose <span className="bm-req">*</span></label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Describe the purpose of this booking..."
              className="bm-textarea"
            />
          </div>

          {modalError && <div className="bm-error">{modalError}</div>}

          {/* Actions */}
          <div className="bm-actions">
            <button type="button" className="bm-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="bm-submit-btn" disabled={submitting}>
              {submitting ? (
                <span className="bm-spinner">⏳ Creating...</span>
              ) : (
                '📅 Confirm Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;