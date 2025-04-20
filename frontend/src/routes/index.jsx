import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import BookDetails from '../pages/BookDetails';
import UploadBook from '../pages/UploadBook';
import AdminDashboard from '../pages/AdminDashboard';
import ChangePassword from '../pages/ChangePassword';
import Books from '../pages/Books';
import TransactionDetail from '../pages/TransactionDetail';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import Layout from '../components/Layout';

// Create routes with Layout
const createRouteWithLayout = (element) => {
  return <Layout>{element}</Layout>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: createRouteWithLayout(<Home />)
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/dashboard',
    element: createRouteWithLayout(
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/books',
    element: createRouteWithLayout(<Books />)
  },
  {
    path: '/books/:id',
    element: createRouteWithLayout(<BookDetails />)
  },
  {
    path: '/upload',
    element: createRouteWithLayout(
      <ProtectedRoute>
        <UploadBook />
      </ProtectedRoute>
    )
  },
  {
    path: '/transactions/:id',
    element: createRouteWithLayout(
      <ProtectedRoute>
        <TransactionDetail />
      </ProtectedRoute>
    )
  },
  {
    path: '/change-password',
    element: createRouteWithLayout(
      <ProtectedRoute>
        <ChangePassword />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin',
    element: createRouteWithLayout(
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    )
  }
]); 