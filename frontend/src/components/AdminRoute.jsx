import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const { showError } = useNotification();
  const location = useLocation();

  if (loading) {
    return <div className="w-full py-8 text-center">Loading...</div>;
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is not an admin, redirect to dashboard with error
  if (!isAdmin()) {
    // Show access denied notification
    showError('Access denied: Admin privileges required');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute; 