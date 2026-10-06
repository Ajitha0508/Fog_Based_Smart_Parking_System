import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Synchronous initialization from localStorage memory:
  // Instant load without flicker or asking for credentials again!
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // If token and user already exist in browser storage, no loading screen is needed!
  const [isLoading, setIsLoading] = useState(() => {
    const hasToken = !!localStorage.getItem('token');
    const hasUser = !!localStorage.getItem('user');
    return hasToken && !hasUser;
  });

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Verify with backend in the background to ensure session freshness
          const userData = await authService.getMe();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
          // ONLY clear session if server explicitly rejects token with 401 or 403
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.warn('Session expired or revoked by server. Clearing credentials.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          } else {
            // If it's a network issue or cold start, KEEP the user logged in using cached localStorage!
            console.log('Server unreachable or waking up; maintaining active cached session.');
          }
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    // Persist in localStorage memory
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('saved_email', email);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('saved_email', userData.email);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const updated = await authService.getMe();
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        role: user?.role || null,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
