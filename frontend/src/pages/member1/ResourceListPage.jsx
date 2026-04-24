


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
  const [allResources, setAllResources] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER';
  const isTechnician = user?.role === 'TECHNICIAN';
  
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
    if (!isUser) {
      fetchFilteredResources(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUser]);

  useEffect(() => {
    if (isUser) {
      getAllResources()
        .then(res => {
          setAllResources(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => setAllResources([]))
        .finally(() => setDashboardLoading(false));
    }
  }, [isUser]);

  const handleStatusChange = (resourceId, newStatus) => {
    setResources(prev => prev.map(r =>
      (r._id || r.id) === resourceId
        ? { ...r, status: newStatus }
        : r
    ));
  };

  const totalCount = allResources.length;
  const activeCount = allResources.filter(r => r.status === 'ACTIVE').length;
  const outCount = allResources.filter(r => r.status === 'OUT_OF_SERVICE').length;
  const lectureHallCount = allResources.filter(r => r.type === 'LECTURE_HALL').length;
  const labCount = allResources.filter(r => r.type === 'LAB').length;
  const meetingRoomCount = allResources.filter(r => r.type === 'MEETING_ROOM').length;
  const equipmentCount = allResources.filter(r => r.type === 'EQUIPMENT').length;
  const activePercent = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
  const outPercent = totalCount > 0 ? Math.round((outCount / totalCount) * 100) : 0;

  if (isUser) {
    if (dashboardLoading) {
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
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
          Facilities Dashboard
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
          Overview of campus facilities and operational status
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'rgba(30,41,59,0.7)', border: '1px solid rgba(71,85,105,0.8)', borderRadius: '12px', padding: '24px' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>TOTAL FACILITIES</p>
            <p style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff' }}>{totalCount}</p>
          </div>

          <div style={{ backgroundColor: 'rgba(30,41,59,0.7)', border: '1px solid rgba(71,85,105,0.8)', borderRadius: '12px', padding: '24px' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>ACTIVE FACILITIES</p>
            <p style={{ fontSize: '36px', fontWeight: 700, color: '#4ade80' }}>{activeCount}</p>
          </div>

          <div style={{ backgroundColor: 'rgba(30,41,59,0.7)', border: '1px solid rgba(71,85,105,0.8)', borderRadius: '12px', padding: '24px' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>OUT OF SERVICE</p>
            <p style={{ fontSize: '36px', fontWeight: 700, color: '#f87171' }}>{outCount}</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(30,41,59,0.7)', border: '1px solid rgba(71,85,105,0.8)', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
              Explore All Facilities
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0' }}>
              Browse all available campus facilities
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/resources/explore')}
          >
            Explore All
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ backgroundColor: 'rgba(30,41,59,0.7)', border: '1px solid rgba(71,85,105,0.8)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '20px' }}>
              Facilities by Type
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#e2e8f0' }}>Lecture Hall</span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{lectureHallCount}</span>
              </div>
              <div style={{ backgroundColor: 'rgba(71,85,105,0.4)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: totalCount > 0 ? (lectureHallCount / totalCount * 100) + '%' : '0%', backgroundColor: '#6366f1', height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#e2e8f0' }}>Lab</span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{labCount}</span>
              </div>
              <div style={{ backgroundColor: 'rgba(71,85,105,0.4)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: totalCount > 0 ? (labCount / totalCount * 100) + '%' : '0%', backgroundColor: '#6366f1', height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#e2e8f0' }}>Meeting Room</span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{meetingRoomCount}</span>
              </div>
              <div style={{ backgroundColor: 'rgba(71,85,105,0.4)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: totalCount > 0 ? (meetingRoomCount / totalCount * 100) + '%' : '0%', backgroundColor: '#6366f1', height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#e2e8f0' }}>Equipment</span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{equipmentCount}</span>
              </div>
              <div style={{ backgroundColor: 'rgba(71,85,105,0.4)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: totalCount > 0 ? (equipmentCount / totalCount * 100) + '%' : '0%', backgroundColor: '#6366f1', height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(30,41,59,0.7)', border: '1px solid rgba(71,85,105,0.8)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '20px' }}>
              Status Distribution
            </h3>

            <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ width: activePercent + '%', backgroundColor: '#22c55e', transition: 'width 0.3s ease' }} />
              <div style={{ width: outPercent + '%', backgroundColor: '#ef4444', transition: 'width 0.3s ease' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#22c55e' }}>●</span>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                  ACTIVE ({activePercent}%)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#ef4444' }}>●</span>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                  OUT OF SERVICE ({outPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isTableView = isAdmin || isTechnician || !isUser;

  if (isTableView) {
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
              {isAdmin && (
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

  return (
    null
  );
}

export default ResourceListPage;