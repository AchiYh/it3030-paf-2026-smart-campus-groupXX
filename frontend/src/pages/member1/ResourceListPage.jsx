import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ResourceFilters from '../../components/member1/ResourceFilters';
import ResourceTable from '../../components/member1/ResourceTable';
import { getAllResources, searchResources } from '../../services/member1/resourceService';

function ResourceListPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    minCapacity: '',
    status: '',
  });

  const fetchFilteredResources = async (nextFilters) => {
    setLoading(true);
    setError('');
    setFilters(nextFilters);
    try {
      const hasFilters = Object.values(nextFilters).some(
        (value) => value !== null && value !== undefined && String(value).trim() !== '',
      );
      const response = hasFilters
        ? await searchResources(nextFilters)
        : await getAllResources();
      const resourceList = Array.isArray(response.data) ? response.data : [];
      setResources(resourceList);
    } catch (err) {
      if (err.response || err.request) {
        setError('Unable to load resources right now. Please try again in a moment.');
      } else {
        setError('Something went wrong while loading resources. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredResources(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = (resourceId, newStatus) => {
    setResources(prev => prev.map(r =>
      (r._id || r.id) === resourceId
        ? { ...r, status: newStatus }
        : r
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            🏢 Campus Resources
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage and view all campus facilities and assets
          </p>
        </div>

        {/* Filters Card */}
        <div
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(71, 85, 105, 0.8)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Search & Filter
          </p>
          <ResourceFilters onSearch={fetchFilteredResources} />
        </div>

        {/* Table Card */}
        <div
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(71, 85, 105, 0.8)',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(71, 85, 105, 0.5)',
            }}
          >
            <div>
              <h2 className="text-lg font-semibold text-white">Resource List</h2>
              <p className="text-xs text-slate-400">
                Showing {resources.length} resources
              </p>
            </div>
            {user?.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => navigate('/resources/new')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                + Add New Resource
              </button>
            )}
          </div>
          <div className="p-4 w-full">
            <ResourceTable
              resources={resources}
              loading={loading}
              error={error}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default ResourceListPage;