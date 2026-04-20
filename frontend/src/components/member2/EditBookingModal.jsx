import { useState } from 'react';

function EditBookingModal({ booking, onClose, onUpdate }) {
    const isEquipment = booking.resourceType === 'Equipment' || booking.resourceDetails?.type === 'Equipment';
    
    // Get resource details if available
    const resourceDetails = booking.resourceDetails;
    const maxQuantity = isEquipment ? resourceDetails?.availableCount : resourceDetails?.capacity;
    const quantityLabel = isEquipment ? 'Quantity' : 'Attendees';
    
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
            setError('End time must be after start time');
            setSubmitting(false);
            return;
        }

        const valueToCheck = isEquipment ? formData.quantity : formData.attendees;
        if (maxQuantity && valueToCheck > maxQuantity) {
            setError(`${quantityLabel} cannot exceed ${maxQuantity}`);
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
            setError(err.message || 'Failed to update booking');
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
                    {/* Read-only Info Section */}
                    <div className="modal-info-section">
                        <div className="modal-info-row">
                            <div className="modal-info-field">
                                <label>📍 Location</label>
                                <div className="info-value">{resourceDetails?.location || booking.location || 'Not specified'}</div>
                            </div>
                            <div className="modal-info-field">
                                <label>{isEquipment ? '📊 Available' : '👥 Max Capacity'}</label>
                                <div className="info-value">
                                    {isEquipment 
                                        ? `${resourceDetails?.availableCount} out of ${resourceDetails?.totalCount}` 
                                        : `${maxQuantity} people`}
                                </div>
                            </div>
                        </div>
                        {resourceDetails?.roomNumber && (
                            <div className="modal-info-row" style={{ marginTop: '0.5rem' }}>
                                <div className="modal-info-field">
                                    <label>🏠 Room Number</label>
                                    <div className="info-value">{resourceDetails.roomNumber}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Editable Fields */}
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
                            max={maxQuantity || 1000}
                            required
                        />
                        {isEquipment && resourceDetails?.availableCount <= 3 && resourceDetails?.availableCount > 0 && (
                            <div className="field-warning">⚠️ Only {resourceDetails?.availableCount} items left in stock!</div>
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