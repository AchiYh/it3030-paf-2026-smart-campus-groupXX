import { useEffect } from 'react';
<<<<<<< HEAD
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchUser } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            // The token is already set in a cookie by the backend (HttpOnly)
            // Or if you use localStorage, you'd set it here.
            // For our current logic, we just need to refresh the user context.
            fetchUser().then(() => {
                navigate('/', { replace: true });
            }).catch(() => {
                navigate('/login', { replace: true });
            });
        } else {
            navigate('/login', { replace: true });
        }
    }, [location, navigate, fetchUser]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }}>
            <div className="loading-spinner">Completing login...</div>
        </div>
    );
};
=======
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authenticateWithToken } = useAuth(); // We need to add this method to AuthContext

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // If we got a token, save it and load user data
      authenticateWithToken(token).then(() => {
        navigate('/', { replace: true });
      }).catch(err => {
        console.error("OAuth2 Login Failed", err);
        navigate('/login', { replace: true });
      });
    } else {
      // Something went wrong
      navigate('/login', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
      <div style={{ color: 'white', fontSize: '1.5rem' }}>Logging you in...</div>
    </div>
  );
}
>>>>>>> develop-branch

export default OAuth2RedirectHandler;
