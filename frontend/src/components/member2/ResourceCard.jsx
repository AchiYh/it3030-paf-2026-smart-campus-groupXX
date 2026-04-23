import React, { useState } from 'react';
import BookingModal from './BookingModal';

const getIcon = (type) => {
  if (type === 'Lecture Halls') return '🏛️';
  if (type === 'Labs') return '💻';
  if (type === 'Meeting Rooms') return '📚';
  return '📹';
};

function ResourceCard({ resource, userEmail, onBookingSuccess, setSuccessMessage, setError }) {
  const [showModal, setShowModal] = useState(false);

  const handleBookNow = () => {
    setShowModal(true);
  };

  return (
    <>
      <div className="resource-card">
        <div className="resource-icon">{getIcon(resource.type)}</div>
        <div className="resource-info">
          <h3>{resource.name}</h3>
          <p className="resource-location">📍 {resource.location}</p>
          <p className="resource-capacity">👥 Capacity: {resource.capacity} people</p>
          <p className="resource-status">
            <span className={`status-dot ${resource.status === 'ACTIVE' ? 'active' : 'inactive'}`}></span>
            {resource.status}
          </p>
        </div>
        <button 
          className="book-now-btn"
          onClick={handleBookNow}
          disabled={resource.status !== 'ACTIVE'}
        >
          📅 Book Now
        </button>
      </div>

      {showModal && (
        <BookingModal
          resource={resource}
          userEmail={userEmail}
          onClose={() => setShowModal(false)}
          onBookingSuccess={onBookingSuccess}
          setSuccessMessage={setSuccessMessage}
          setError={setError}
        />
      )}
    </>
  );
}

export default ResourceCard;