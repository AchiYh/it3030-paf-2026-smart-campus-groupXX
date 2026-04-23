import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import ResourceForm from '../../components/member1/ResourceForm';
import { useAuth } from '../../context/AuthContext';
import { createResource, getResourceById, updateResource } from '../../services/member1/resourceService';

const loadingSpinnerStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '9999px',
  border: '4px solid rgba(165,180,252,0.25)',
  borderTop: '4px solid #6366f1',
  animation: 'spin 0.9s linear infinite',
};

function ResourceFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initialData, setInitialData] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/resources" replace />;
  }

  useEffect(() => {
    if (!isEditMode) {
      setInitialData({});
      return;
    }

    const fetchResource = async () => {
      setIsFetching(true);
      setMessage({ type: '', text: '' });
      try {
        const response = await getResourceById(id);
        setInitialData(response.data || {});
      } catch (error) {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to load resource. Please try again.',
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchResource();
  }, [id, isEditMode]);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isEditMode) {
        await updateResource(id, data);
        setMessage({ type: 'success', text: 'Resource updated successfully.' });
        setTimeout(() => {
          navigate('/resources/' + id);
        }, 1500);
      } else {
        await createResource(data);
        setMessage({ type: 'success', text: 'Resource created successfully.' });
        setTimeout(() => {
          navigate('/resources');
        }, 1500);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} resource. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: '32px 16px',
      }}
    >
      <div className="mx-auto w-full max-w-4xl">
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto 24px auto',
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '4px',
            }}
          >
            <span aria-hidden="true" className="text-2xl">🏢</span>
            {isEditMode ? '✏️ Edit Resource' : 'Add New Resource'}
          </h1>
     
        </div>

        {isEditMode && isFetching && (
          <div
            style={{
              maxWidth: '680px',
              margin: '0 auto 16px auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div style={loadingSpinnerStyle} />
          </div>
        )}

        {message.text && (
          <div
            style={
              message.type === 'success'
                ? {
                    padding: '12px 16px',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    color: '#4ade80',
                    fontSize: '14px',
                    maxWidth: '680px',
                    margin: '0 auto 16px auto',
                  }
                : {
                    padding: '12px 16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#f87171',
                    fontSize: '14px',
                    maxWidth: '680px',
                    margin: '0 auto 16px auto',
                  }
            }
          >
            {message.text}
          </div>
        )}

        <ResourceForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel={isEditMode ? 'Update Resource' : 'Create Resource'}
        />
      </div>
    </div>
  );
}

export default ResourceFormPage;
// ResourceFormPage - Member 1
