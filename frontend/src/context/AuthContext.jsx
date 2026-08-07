import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('quickbite_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('quickbite_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          localStorage.setItem('quickbite_user', JSON.stringify(userData));
        } catch (err) {
          console.error("Auth check failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('quickbite_token', data.access_token);
    localStorage.setItem('quickbite_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('quickbite_token', data.access_token);
    localStorage.setItem('quickbite_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('quickbite_token');
    localStorage.removeItem('quickbite_user');
  };

  const updateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('quickbite_user', JSON.stringify(updatedData));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
