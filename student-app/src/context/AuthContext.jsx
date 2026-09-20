import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Store JWT in memory only (not in localStorage)
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { access_token, user: userData } = res.data;
      if (userData.role !== 'student') {
        throw { message: 'Access denied: Please use student credentials for this portal.' };
      }
      setToken(access_token);
      setUser(userData);
      setAuthToken(access_token);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const loginWithDemo = async () => {
    return login('student@demo.com', 'demo123');
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register({ ...userData, role: 'student' });
      const { access_token, user: newUserData } = res.data;
      setToken(access_token);
      setUser(newUserData);
      setAuthToken(access_token);
      return newUserData;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const refreshUser = async () => {
    if (!token) return null;
    try {
      const res = await authApi.getMe();
      setUser(res.data);
      return res.data;
    } catch (err) {
      logout();
      return null;
    }
  };

  const updateLocalUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        loginWithDemo,
        register,
        logout,
        refreshUser,
        updateLocalUser,
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
