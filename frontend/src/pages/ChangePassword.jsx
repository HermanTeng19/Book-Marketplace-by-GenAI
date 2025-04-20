import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { changePassword, error: authError } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  // Show auth error from context if present
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    // Check if current password is provided
    if (!formData.currentPassword.trim()) {
      setError('Current password is required');
      return false;
    }

    // Check if new password is at least 6 characters
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return false;
    }

    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      if (result.success) {
        // Password changed successfully
        showSuccess('Password changed successfully. Please use your new password next time you log in.');
        
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to change password. Please try again.');
        showError(result.error || 'Failed to change password');
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      console.error('Change password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Change Password
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="currentPassword" 
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Current Password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.currentPassword}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <label 
            htmlFor="newPassword" 
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.newPassword}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-6">
          <label 
            htmlFor="confirmPassword" 
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Password...
              </span>
            ) : (
              'Change Password'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword; 