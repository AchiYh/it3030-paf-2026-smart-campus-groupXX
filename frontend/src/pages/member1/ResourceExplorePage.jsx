import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllResources } from '../../services/member1/resourceService';

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
  const cardsRef = useRef(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getAllResources();
        setResources(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load facilities.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch = !normalizedSearch
        || resource.name?.toLowerCase().includes(normalizedSearch)
        || resource.location?.toLowerCase().includes(normalizedSearch);

      const matchesType = !typeFilter || resource.type === typeFilter;
      const matchesStatus = !statusFilter || resource.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [resources, searchTerm, typeFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Available Facilities</h1>
            <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '14px' }}>Explore campus facilities and resources</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            Explore All
          </button>
        </div>

        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(71, 85, 105, 0.8)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by facility name or location"
            className="form-control"
            style={{ marginBottom: '14px' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <select
              className="form-control"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="LECTURE_HALL">LECTURE_HALL</option>
              <option value="LAB">LAB</option>
              <option value="MEETING_ROOM">MEETING_ROOM</option>
              <option value="EQUIPMENT">EQUIPMENT</option>
            </select>

            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '12px', padding: '16px', color: '#fca5a5', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '180px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '9999px', border: '4px solid rgba(165,180,252,0.25)', borderTop: '4px solid #6366f1', animation: 'spin 0.9s linear infinite' }} />
          </div>
        ) : (
          <div
            ref={cardsRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredResources.map((resource) => (
              <div
                key={resource.id || resource._id}
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(71, 85, 105, 0.8)',
                  borderRadius: '12px',
                  padding: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '19px', color: '#ffffff', fontWeight: 700 }}>{resource.name || '-'}</h3>
                  <span
                    style={{
                      backgroundColor: resource.status === 'ACTIVE' ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)',
                      color: resource.status === 'ACTIVE' ? '#4ade80' : '#f87171',
                      border: resource.status === 'ACTIVE' ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(239,68,68,0.35)',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {resource.status === 'ACTIVE' ? 'ACTIVE' : 'OUT OF SERVICE'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Type</p>
                    <p style={{ margin: '2px 0 0', color: '#e2e8f0', fontSize: '14px' }}>{toReadableType(resource.type)}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Location</p>
                    <p style={{ margin: '2px 0 0', color: '#e2e8f0', fontSize: '14px' }}>{resource.location || '-'}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Capacity</p>
                    <p style={{ margin: '2px 0 0', color: '#e2e8f0', fontSize: '14px' }}>{resource.capacity ?? 'Not specified'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/resources/' + resource.id)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceExplorePage;