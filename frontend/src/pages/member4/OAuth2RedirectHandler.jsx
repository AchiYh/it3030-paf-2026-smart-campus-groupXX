import { useEffect } from 'react';
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

export default OAuth2RedirectHandler;
