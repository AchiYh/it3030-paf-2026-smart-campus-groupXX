import { useState } from 'react';
import './BookingModal.css'; /* reuse same modal styles */

function EditBookingModal({ booking, onClose, onUpdate }) {
  const isEquipment = booking.resourceType === 'Equipment' || booking.resourceDetails?.type === 'Equipment';
  const resourceDetails = booking.resourceDetails;
  const maxQuantity = isEquipment ? resourceDetails?.availableCount : resourceDetails?.capacity;
  const quantityLabel = isEquipment ? 'Quantity Needed' : 'Attendees';

  const [formData, setFormData] = useState({
    resourceId: booking.resourceId,
    resourceName: booking.resourceName,
    resourceType: booking.resourceType,
    userEmail: booking.userEmail,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    purpose: booking.purpose,
    attendees: booking.attendees,
    quantity: booking.quantity || 1
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
      setError('End time must be after start time.');
      setSubmitting(false);
      return;
    }

    const valueToCheck = isEquipment ? formData.quantity : formData.attendees;
    if (maxQuantity && valueToCheck > maxQuantity) {
      setError(`${quantityLabel} cannot exceed ${maxQuantity}.`);
      setSubmitting(false);
      return;
    }

    try {
      const updatedData = {
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
      await onUpdate(booking.id, updatedData);
    } catch (err) {
      setError(err.message || 'Failed to update booking.');
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
          <div className="bm-header-icon">{TYPE_ICONS[booking.resourceType] || '✏️'}</div>
          <div>
            <h2 className="bm-header-title">Edit Booking</h2>
            <p className="bm-header-sub">{booking.resourceName}</p>
          </div>
          <button className="bm-close" onClick={onClose}>✕</button>
        </div>

        {/* Info Strip */}
        <div className="bm-info-strip">
          <div className="bm-info-item">
            <span className="bm-info-label">📍 Location</span>
            <span className="bm-info-value">{resourceDetails?.location || booking.location || '—'}</span>
          </div>
          <div className="bm-info-item">
            <span className="bm-info-label">
              {isEquipment ? '📊 Available' : '👥 Capacity'}
            </span>
            <span className="bm-info-value">
              {isEquipment
                ? `${resourceDetails?.availableCount} / ${resourceDetails?.totalCount}`
                : maxQuantity ? `${maxQuantity?.toLocaleString()} people` : '—'}
            </span>
          </div>
          {resourceDetails?.roomNumber && (
            <div className="bm-info-item">
              <span className="bm-info-label">🏠 Room</span>
              <span className="bm-info-value">{resourceDetails.roomNumber}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bm-form">
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

          <div className="bm-field">
            <label className="bm-label">
              {isEquipment ? '📦' : '👥'} {quantityLabel} <span className="bm-req">*</span>
              {maxQuantity && <span className="bm-max-hint">Max: {maxQuantity}</span>}
            </label>
            <input
              type="number"
              name={isEquipment ? 'quantity' : 'attendees'}
              value={isEquipment ? formData.quantity : formData.attendees}
              onChange={handleChange}
              min="1"
              max={maxQuantity || 10000}
              required
              className="bm-input"
            />
            {isEquipment && resourceDetails?.availableCount <= 3 && resourceDetails?.availableCount > 0 && (
              <p className="bm-warn">⚠️ Only {resourceDetails?.availableCount} items left!</p>
            )}
          </div>

          <div className="bm-field">
            <label className="bm-label">📝 Purpose <span className="bm-req">*</span></label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              rows="3"
              className="bm-textarea"
            />
          </div>

          {error && <div className="bm-error">{error}</div>}

          <div className="bm-actions">
            <button type="button" className="bm-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="bm-submit-btn" disabled={submitting}>
              {submitting ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBookingModal;