import React from 'react';

const CATEGORIES = ['All', 'Lecture Halls', 'Labs', 'Meeting Rooms', 'Equipment'];
const LOCATIONS = ['All Locations', 'Main Building', 'Tech Wing', 'Admin Block', 'Science Block', 'Media Center', 'New Building'];

function ResourceFilters({ filters, setFilters }) {
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="resource-filters">
      {/* Search Bar */}
      <div className="filter-search">
        <input
          type="text"
          placeholder="🔍 Search by resource name or type..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="search-input"
        />
      </div>

      {/* Category Chips - NO duplicate dropdown */}
      <div className="filter-categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-chip ${filters.category === cat ? 'active' : ''}`}
            onClick={() => updateFilter('category', cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter Row - Only Max Capacity, no Min Capacity */}
      <div className="filter-row">
        <div className="filter-group">
          <label>📍 LOCATION</label>
          <select 
            value={filters.location} 
            onChange={(e) => updateFilter('location', e.target.value)}
            className="filter-select"
          >
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>📊 MAX CAPACITY (UP TO)</label>
          <input
            type="number"
            placeholder="e.g., 100"
            value={filters.maxCapacity}
            onChange={(e) => updateFilter('maxCapacity', e.target.value)}
            className="filter-input"
          />
        </div>

        <button 
          className="clear-filters"
          onClick={() => setFilters({ search: '', category: 'All', location: 'All Locations', maxCapacity: '' })}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

export default ResourceFilters;