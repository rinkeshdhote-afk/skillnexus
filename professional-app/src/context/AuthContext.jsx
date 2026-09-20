import React, { createContext, useContext, useState } from 'react';
import { authApi, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { access_token, user: userData } = res.data;
      if (userData.role === 'student') {
        throw { message: 'Access denied: Please use the Student portal for student accounts.' };
      }
      setToken(access_token);
      setUser(userData);
      setAuthToken(access_token);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const loginAsMentor = async () => {
    return login('professional@demo.com', 'demo123');
  };

  const loginAsAcademician = async () => {
    return login('academic@demo.com', 'demo123');
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
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

  const isAcademician = user?.role === 'academician';
  const isProfessional = user?.role === 'professional';
  const subRole = user?.professional_profile?.sub_role || (isAcademician ? 'mentor' : 'recruiter');

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isAcademician,
        isProfessional,
        subRole,
        loading,
        login,
        loginAsMentor,
        loginAsAcademician,
        register,
        logout,
        refreshUser,
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
