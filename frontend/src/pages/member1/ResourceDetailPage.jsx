import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteResource, getResourceById } from '../../services/member1/resourceService';
import { useAuth } from '../../context/AuthContext';

const toReadableType = (type) => {
  if (!type) return '-';
  return type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const loadingSpinnerStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '9999px',
  border: '4px solid rgba(165,180,252,0.25)',
  borderTop: '4px solid #6366f1',
  animation: 'spin 0.9s linear infinite',
};

function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchResource = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getResourceById(id);
        if (isMounted) {
          setResource(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load resource.');
          setResource(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResource();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this resource?');
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await deleteResource(id);
      navigate('/resources');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resource.');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status) => {
    if (status === 'ACTIVE') {
      return {
        border: '1px solid rgba(16,185,129,0.3)',
        backgroundColor: 'rgba(16,185,129,0.2)',
        color: '#34d399',
      };
    }

    return {
      border: '1px solid rgba(239,68,68,0.3)',
      backgroundColor: 'rgba(239,68,68,0.2)',
      color: '#f87171',
    };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={loadingSpinnerStyle} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => navigate('/resources')}
          style={{
            background: 'none',
            border: 'none',
            color: '#a5b4fc',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Back to Resources
        </button>

        <div style={{ backgroundColor: 'rgba(30,41,59,0.7)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', padding: '24px', color: '#fca5a5' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!resource) {
    return null;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', color: '#f8fafc' }}>
      <button
        type="button"
        onClick={() => navigate('/resources')}
        style={{
          background: 'none',
          border: 'none',
          color: '#a5b4fc',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        ← Back to Resources
      </button>

      <div style={{ backgroundColor: 'rgba(30,41,59,0.7)', border: '1px solid rgba(71,85,105,0.8)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '30px', fontWeight: 700, color: '#ffffff' }}>{resource.name || '-'}</h1>
            <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '14px' }}>{toReadableType(resource.type)}</p>
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.025em',
              textTransform: 'uppercase',
              ...statusBadge(resource.status),
            }}
          >
            {resource.status === 'ACTIVE' ? '● Active' : '● Out of Service'}
          </span>
        </div>
      </div>

      <div style={{ backgroundColor: 'rgba(30,41,59,0.7)', border: '1px solid rgba(71,85,105,0.8)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Location</div>
            <div style={{ fontSize: '15px', color: '#e2e8f0' }}>{resource.location || '-'}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Capacity</div>
            <div style={{ fontSize: '15px', color: '#e2e8f0' }}>{resource.capacity ?? 'Not specified'}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Availability Windows</div>
            <div style={{ fontSize: '15px', color: '#e2e8f0' }}>{resource.availabilityWindows || 'Not specified'}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Created At</div>
            <div style={{ fontSize: '15px', color: '#e2e8f0' }}>{formatDate(resource.createdAt)}</div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Description</div>
            <div style={{ fontSize: '15px', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{resource.description || 'No description'}</div>
          </div>
        </div>
      </div>

      {user?.role === 'ADMIN' && (
        <div style={{ backgroundColor: 'rgba(30,41,59,0.7)', border: '1px solid rgba(71,85,105,0.8)', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Admin Actions</h2>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate(`/resources/${id}/edit`)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: 'rgba(99,102,241,0.2)',
                border: '1px solid rgba(99,102,241,0.4)',
                color: '#a5b4fc',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              ✏️ Edit Resource
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={actionLoading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239,68,68,0.2)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#f87171',
                cursor: 'pointer',
                fontSize: '14px',
                opacity: actionLoading ? 0.7 : 1,
              }}
            >
              🗑️ Delete Resource
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceDetailPage;// ResourceDetailPage - Member 1
