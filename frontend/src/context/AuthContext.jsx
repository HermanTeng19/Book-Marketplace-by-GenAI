import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored token and fetch user data if available
    const checkAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('Checking authentication with token...');
          const data = await authService.getCurrentUser();
          if (data.success && data.user) {
            console.log('User authenticated:', data.user);
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            console.log('Token invalid or user data missing');
            // If token is invalid, clear it
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log('No token found, user is not authenticated');
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting login for:', email);
      const data = await authService.login(email, password);
      
      if (data.success && data.token && data.user) {
        console.log('Login successful, token received');
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('User data set:', data.user);
        return { success: true, user: data.user };
      } else {
        console.log('Login failed:', data.error || 'Unknown error');
        setError(data.error || 'Login failed');
        setIsAuthenticated(false);
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      console.error('Login exception:', errorMessage);
      setError(errorMessage);
      setIsAuthenticated(false);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting registration for:', userData.email);
      const data = await authService.register(userData);
      
      if (data.success && data.token && data.user) {
        console.log('Registration successful, token received');
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('User data set:', data.user);
        return { success: true, user: data.user };
      } else {
        console.log('Registration failed:', data.error || 'Unknown error');
        setError(data.error || 'Registration failed');
        setIsAuthenticated(false);
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      console.error('Registration exception:', errorMessage);
      setError(errorMessage);
      setIsAuthenticated(false);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Logging out user...');
        // Call the backend logout endpoint to blacklist the token
        const response = await authService.logout();
        if (!response.success) {
          console.warn('Server-side logout failed:', response.error);
        }
      }
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      // Even if server-side logout fails, we should clear local state
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setLoading(false);
      console.log('User logged out, state cleared');
    }
  };

  const verifyEmail = async (token) => {
    try {
      const data = await authService.verifyEmail(token);
      return data;
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Email verification failed' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const data = await authService.forgotPassword(email);
      return data;
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Password reset request failed' };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const data = await authService.resetPassword(token, password);
      return data;
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Password reset failed' };
    }
  };

  // Change password for authenticated user
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      setError(null);
      const data = await authService.changePassword(currentPassword, newPassword, confirmPassword);
      
      if (data.success) {
        // Update token since the server issues a new token after password change
        localStorage.setItem('token', data.token);
        return { success: true, message: data.message };
      } else {
        setError(data.error || 'Failed to change password');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to change password. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Check if the user is an admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      error,
      isAuthenticated,
      verifyEmail,
      forgotPassword,
      resetPassword,
      changePassword,
      isAdmin
    }}>
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