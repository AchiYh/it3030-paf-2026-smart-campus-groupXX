import { useEffect } from 'react';
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

export default OAuth2RedirectHandler;
