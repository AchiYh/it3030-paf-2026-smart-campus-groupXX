import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component for role-based access control.
 * Wraps protected routes to enforce authentication and optional role requirements.
 *
 * @param {React.ReactNode} children - Protected content
 * @param {string[]} roles - Optional required roles (e.g., ['ADMIN', 'TECHNICIAN'])
 */
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
