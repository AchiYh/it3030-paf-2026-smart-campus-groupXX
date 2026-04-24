import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.authenticated && res.data?.user) {
        // Normalize role structure if needed
        const fetchedUser = {
          ...res.data.user,
          role: res.data.user.role || 'USER'
        };
        setUser(fetchedUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setUser(null);
    }
  }, []);

  // Backwards compatibility for authenticateWithToken if needed by oauth callback
  const authenticateWithToken = useCallback(async () => {
     // Token is set as cookie via backend, just fetch user
     await fetchUser();
     return true;
  }, [fetchUser]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';

  const value = {
    user, 
    loading, 
    isAuthenticated, 
    isAdmin, 
    isTechnician,
    logout, 
    authenticateWithToken, 
    fetchUser
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

export { AuthContext };
