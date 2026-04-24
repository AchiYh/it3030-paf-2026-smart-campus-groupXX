import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllResources } from '../../services/member1/resourceService';
import { useAuth } from '../../context/AuthContext';

const toReadableType = (type) => {
  if (!type) return '-';
  return type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function ResourceExplorePage() {
  const navigate = useNavigate();
  useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    getAllResources()
      .then(res => setResources(Array.isArray(res.data) ? res.data : []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = resources.filter(r => {
    const matchSearch = !searchText ||
      r.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchText.toLowerCase());
    const matchType = !typeFilter || r.type === typeFilter;
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  if (loading) {
    return (
      <div style={{ padding: '24px', color: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '9999px', border: '4px solid rgba(165,180,252,0.25)', borderTop: '4px solid #6366f1', animation: 'spin 0.9s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', color: '#f8fafc' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>
        Available Facilities
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
        Explore campus facilities and resources currently listed in the catalogue
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search by facility name or location"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="form-control"
          style={{ flex: 2, minWidth: '200px' }}
        />

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="form-control"
          style={{ flex: 1, minWidth: '140px' }}
        >
          <option value="">All Types</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="LAB">Laboratory</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="form-control"
          style={{ flex: 1, minWidth: '140px' }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ backgroundColor: 'rgba(30,41,59,0.7)', border: '1px solid rgba(71,85,105,0.8)', borderRadius: '12px', padding: '20px' }}>
          No facilities found
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map((resource) => (
            <div
              key={resource.id || resource._id}
              style={{ backgroundColor: 'rgba(30,41,59,0.7)', border: '1px solid rgba(71,85,105,0.8)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>{resource.name}</div>
                {resource.status === 'ACTIVE' ? (
                  <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                    ACTIVE
                  </span>
                ) : (
                  <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                    OUT OF SERVICE
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Type</span>
                <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{toReadableType(resource.type)}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Location</span>
                <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{resource.location || '-'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Capacity</span>
                <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{resource.capacity ?? 'Not specified'}</span>
              </div>

              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => navigate('/resources/' + resource.id)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResourceExplorePage;