import { useEffect, useState } from 'react';

import ResourceTable from '../../components/member1/ResourceTable';
import { getAllResources } from '../../services/member1/resourceService';

function ResourceListPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getAllResources();
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

    fetchResources();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 rounded-xl border border-indigo-500/20 bg-slate-800/70 p-6 shadow-xl backdrop-blur-sm">
          <h1 className="text-3xl font-bold tracking-tight text-white">Campus Resources</h1>
          <p className="mt-2 text-sm text-slate-300">Showing {resources.length} resources</p>
        </div>

        <ResourceTable resources={resources} loading={loading} error={error} />
      </div>
    </div>
  );
}

export default ResourceListPage;
// ResourceListPage - Member 1
