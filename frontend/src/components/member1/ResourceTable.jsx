import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

  let content;

  if (loading) {
    content = (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-300 border-t-indigo-600" />
      </div>
    );
  }

  if (!content && error) {
    content = (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
        {error}
      </div>
    );
  }

  if (!content && (!resources || resources.length === 0)) {
    content = (
      <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-8 text-center text-slate-300">
        No resources found yet
      </div>
    );
  }

  if (!content) {
    content = (
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/70 shadow-xl">
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
              <tr key={resource.id} className="text-sm text-slate-200">
                <td className="px-6 py-4 font-medium text-white">{resource.name}</td>
                <td className="px-6 py-4">{toReadableType(resource.type)}</td>
                <td className="px-6 py-4">{resource.location}</td>
                <td className="px-6 py-4">{resource.capacity ?? '-'}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      resource.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {resource.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/resources/${resource.id}`)}
                   className="btn btn-secondary px-3 py-2 text-xs"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end" >
       
        {user?.role === 'ADMIN' && (
          <button
            type="button"
            onClick={() => navigate('/resources/new')}
            className="btn btn-primary"
          >
            Add New Resource
          </button>
        )}
      </div>
      {content}
    </div>
  );
}

export default ResourceTable;
// ResourceTable component - Member 1
