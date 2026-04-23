import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import ResourceForm from '../../components/member1/ResourceForm';
import { useAuth } from '../../context/AuthContext';
import { createResource } from '../../services/member1/resourceService';

function ResourceFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/resources" replace />;
  }

  const handleSubmit = async (data) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await createResource(data);
      setMessage({ type: 'success', text: 'Resource created successfully.' });
      setTimeout(() => {
        navigate('/resources');
      }, 1500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create resource. Please try again.',
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
            Add New Resource
          </h1>
     
        </div>

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
          initialData={{}}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Create Resource"
        />
      </div>
    </div>
  );
}

export default ResourceFormPage;
// ResourceFormPage - Member 1
