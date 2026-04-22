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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 rounded-xl border border-indigo-500/20 bg-slate-800/70 p-6 shadow-xl backdrop-blur-sm">
          <h1 className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight text-white">
            <span aria-hidden="true" className="text-2xl">🏢</span>
            Add New Resource
          </h1>
     
        </div>

        {message.text && (
          <div
            className={`mb-4 rounded-xl border p-4 text-sm ${
              message.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-red-500/40 bg-red-500/10 text-red-300'
            }`}
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
