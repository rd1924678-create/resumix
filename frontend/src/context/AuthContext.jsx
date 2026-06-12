import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getProfile();
        if (res.data.success) {
          setUser(res.data._id ? res.data : res.data.data);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.data.success) {
        const { token: userToken, ...userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await authService.register(name, email, password);
      if (res.data.success) {
        const { token: userToken, ...userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      const res = await authService.forgotPassword(email);
      return { success: true, message: res.data.message, resetToken: res.data.resetToken };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Error requesting reset.'
      };
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      const res = await authService.resetPassword(resetToken, password);
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Password reset failed.'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
