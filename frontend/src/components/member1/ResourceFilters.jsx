import { useState } from 'react';

const initialFilters = {
  type: '',
  location: '',
  minCapacity: '',
  status: '',
};

function ResourceFilters({ onSearch }) {
  const [filters, setFilters] = useState(initialFilters);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const cleanedFilters = {
      type: filters.type === '' ? null : filters.type,
      location: filters.location === '' ? null : filters.location,
      minCapacity: filters.minCapacity === '' ? null : Number(filters.minCapacity),
      status: filters.status === '' ? null : filters.status,
    };
    onSearch(cleanedFilters);
  };

  const handleClear = () => {
    setFilters(initialFilters);
    onSearch({
      type: null,
      location: null,
      minCapacity: null,
      status: null,
    });
  };

  return (
    <div className="mb-6 rounded-xl border border-indigo-500/20 bg-slate-800/70 p-6 shadow-xl backdrop-blur-sm">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        <div className="form-group mb-0" style={{ flex: '1', minWidth: '160px' }}>
          <label htmlFor="filterType">Type</label>
          <select
            id="filterType"
            name="type"
            className="form-control"
            value={filters.type}
            onChange={handleChange}
          >
            <option value="">All</option>
            <option value="LECTURE_HALL">LECTURE_HALL</option>
            <option value="LAB">LAB</option>
            <option value="MEETING_ROOM">MEETING_ROOM</option>
            <option value="EQUIPMENT">EQUIPMENT</option>
          </select>
        </div>

        <div className="form-group mb-0" style={{ flex: '1', minWidth: '160px' }}>
          <label htmlFor="filterLocation">Location</label>
          <input
            id="filterLocation"
            name="location"
            type="text"
            className="form-control"
            value={filters.location}
            onChange={handleChange}
            placeholder="Search by location"
          />
        </div>

        <div className="form-group mb-0" style={{ flex: '1', minWidth: '160px' }}>
          <label htmlFor="filterMinCapacity">Min Capacity</label>
          <input
            id="filterMinCapacity"
            name="minCapacity"
            type="number"
            min="0"
            className="form-control"
            value={filters.minCapacity}
            onChange={handleChange}
            placeholder="Min capacity"
          />
        </div>

        <div className="form-group mb-0" style={{ flex: '1', minWidth: '160px' }}>
          <label htmlFor="filterStatus">Status</label>
          <select
            id="filterStatus"
            name="status"
            className="form-control"
            value={filters.status}
            onChange={handleChange}
          >
            <option value="">All</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
          </select>
        </div>
      </div>

      <div className="mt-5" style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleClear}
        >
          Clear
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default ResourceFilters;
// ResourceFilters component - Member 1
