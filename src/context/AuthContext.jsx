import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('planio_auth_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('planio_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
    // Default initial mock user
    return {
      id: 1,
      name: 'Darlene Robertson',
      email: 'darlene@planio.dev',
      avatar_initials: 'DR',
      color: '#3b82f6',
      role: 'UI/UX Designer',
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [backendOnline, setBackendOnline] = useState(true);

  // Sync token and user with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('planio_auth_token', token);
    } else {
      localStorage.removeItem('planio_auth_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('planio_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('planio_user');
    }
  }, [user]);

  // Check backend health on mount
  useEffect(() => {
    const verifyHealth = async () => {
      const health = await api.checkHealth();
      setBackendOnline(health.status === 'ok');
    };
    verifyHealth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const data = await api.register(userData);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        openAuthModal,
        backendOnline,
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
