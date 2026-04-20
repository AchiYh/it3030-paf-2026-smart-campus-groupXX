import React from 'react';

const getIcon = (type) => {
  if (type === 'Lecture Halls') return '🏛️';
  if (type === 'Labs') return '💻';
  if (type === 'Meeting Rooms') return '📚';
  return '📹';
};

function ResourceGrid({ resources, onBookNow }) {
  if (resources.length === 0) {
    return (
      <div className="empty-resources">
        <p>No resources match your filters.</p>
        <p className="hint">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="resource-grid">
      {resources.map(resource => (
        <div key={resource.id} className="resource-card">
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
            onClick={() => onBookNow(resource)}
            disabled={resource.status !== 'ACTIVE'}
          >
            📅 Book Now
          </button>
        </div>
      ))}
    </div>
  );
}

export default ResourceGrid;