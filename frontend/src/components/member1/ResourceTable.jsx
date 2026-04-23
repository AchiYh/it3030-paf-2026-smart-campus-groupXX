import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deleteResource } from '../../services/member1/resourceService';
import DeleteModal from './DeleteModal';

const toReadableType = (type) => {
  if (!type) return '-';
  return type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function ResourceTable({ resources, loading, error }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    resourceId: null,
    resourceName: ''
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-300 border-t-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
        {error}
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-8 text-center text-slate-300">
        No resources found yet
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900/60">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/70">
              {resources.map((resource) => (
                <tr
                  key={resource._id || resource.id}
                  className="text-sm text-slate-200 transition hover:bg-slate-700/30"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {resource.name}
                  </td>
                  <td className="px-6 py-4">
                    {toReadableType(resource.type)}
                  </td>
                  <td className="px-6 py-4">{resource.location}</td>
                  <td className="px-6 py-4">
                    {resource.capacity ?? '-'}
                  </td>
                  <td className="px-6 py-4">
                    {resource.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                        ● Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
                        ● Out of Service
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/resources/${resource._id || resource.id}`)}
                        className="btn btn-secondary px-3 py-2 text-xs"
                      >
                        View Details
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({
                              isOpen: true,
                              resourceId: resource._id || resource.id,
                              resourceName: resource.name
                            });
                          }}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <DeleteModal
        isOpen={deleteModal.isOpen}
        resourceName={deleteModal.resourceName}
        onCancel={() => setDeleteModal({
          isOpen: false, resourceId: null, resourceName: ''
        })}
        onConfirm={() => {
          console.log('Deleting ID:', deleteModal.resourceId);
          deleteResource(deleteModal.resourceId)
            .then(() => {
              setDeleteModal({
                isOpen: false, resourceId: null, resourceName: ''
              });
              navigate('/resources');
            })
            .catch(() => console.error('Delete failed'));
        }}
      />
    </>
  );
}

export default ResourceTable;