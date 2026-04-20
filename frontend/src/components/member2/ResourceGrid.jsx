import React from 'react';
import ResourceCard from './ResourceCard';

function ResourceGrid({ resources, userEmail, onBookingSuccess, setSuccessMessage, setError }) {
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
        <ResourceCard
          key={resource.id}
          resource={resource}
          userEmail={userEmail}
          onBookingSuccess={onBookingSuccess}
          setSuccessMessage={setSuccessMessage}
          setError={setError}
        />
      ))}
    </div>
  );
}

export default ResourceGrid;