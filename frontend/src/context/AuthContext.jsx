import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/member4/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser?.id) {
          setUser(parsedUser);
          setLoading(false);
          return;
        }

        try {
          const response = await authService.getCurrentUser();
          const normalizedUser = {
            id: response.data?.id || '',
            email: response.data?.email || parsedUser.email,
            role: response.data?.role || parsedUser.role,
          };
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          setUser(normalizedUser);
        } catch {
          setUser(parsedUser);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { token: newToken, id, email: userEmail, role } = response.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({ id, email: userEmail, role }));
    setToken(newToken);
    setUser({ id, email: userEmail, role });
    return response;
  };

  const register = async (fullName, email, password) => {
    const response = await authService.register(fullName, email, password);
    const { token: newToken, id, email: userEmail, role } = response.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({ id, email: userEmail, role }));
    setToken(newToken);
    setUser({ id, email: userEmail, role });
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated, isAdmin, isTechnician,
      login, register, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
