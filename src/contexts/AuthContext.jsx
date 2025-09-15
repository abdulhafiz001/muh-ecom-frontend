import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasCheckedAuth = useRef(false);
  const retryCount = useRef(0);

  // Check if user is already logged in on app start
  useEffect(() => {
    if (hasCheckedAuth.current) return; // Only check once
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Add a small delay to prevent immediate API calls
      const timer = setTimeout(() => {
        checkAuthStatus();
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
      hasCheckedAuth.current = true;
    }
  }, []);

  const checkAuthStatus = async () => {
    if (hasCheckedAuth.current) return; // Prevent multiple calls
    
    // Limit retries to prevent infinite loops
    if (retryCount.current >= 3) {
      console.log('Max retries reached, stopping auth check');
      setLoading(false);
      return;
    }
    
    try {
      hasCheckedAuth.current = true;
      retryCount.current += 1;
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await authAPI.getUser();
      clearTimeout(timeoutId);
      
      setUser(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Auth check failed:', err);
      
      // If it's a network error or timeout, don't remove the token
      if (err.name === 'AbortError' || err.code === 'ECONNREFUSED' || !err.response) {
        console.log('Server not reachable, keeping token for later');
        setUser(null);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        // Only remove token if it's an authentication error
        localStorage.removeItem('auth_token');
        setUser(null);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(credentials);
      const { user: userData, token } = response.data.data;
      
      localStorage.setItem('auth_token', token);
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      const { user: newUser, token } = response.data.data;
      
      localStorage.setItem('auth_token', token);
      setUser(newUser);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setError(null);
    }
  };

  const clearError = () => setError(null);

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAdmin,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
