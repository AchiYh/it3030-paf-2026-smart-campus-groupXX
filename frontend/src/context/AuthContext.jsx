import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/member4/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    const { token: newToken, email: userEmail, role } = response.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({ email: userEmail, role }));
    setToken(newToken);
    setUser({ email: userEmail, role });
    return response;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const response = await authService.register(fullName, email, password);
    const { token: newToken, email: userEmail, role } = response.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({ email: userEmail, role }));
    setToken(newToken);
    setUser({ email: userEmail, role });
    return response;
  }, []);

  const authenticateWithToken = useCallback(async (newToken) => {
    try {
      // Decode JWT payload (base64)
      const base64Url = newToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decodedPayload = JSON.parse(jsonPayload);
      const userEmail = decodedPayload.sub; // typically subject is email
      const role = decodedPayload.role || 'USER'; // adjust if role claim is named differently

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify({ email: userEmail, role }));
      setToken(newToken);
      setUser({ email: userEmail, role });
      return true;
    } catch (e) {
      console.error("Failed to authenticate with token", e);
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';

  const value = {
    user, token, loading, isAuthenticated, isAdmin, isTechnician,
    login, register, logout, authenticateWithToken
  };

  return (
    <AuthContext.Provider value={value}>
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
