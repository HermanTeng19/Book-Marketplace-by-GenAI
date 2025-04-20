import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import BookGrid from '../components/BookGrid';
import axios from 'axios';
import { API_URL } from '../config';

const AdminDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState('books');
  const navigate = useNavigate();

  // State for data
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  // State for loading and errors
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  // Pagination
  const [booksPage, setBooksPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [booksPagination, setBooksPagination] = useState({});
  const [usersPagination, setUsersPagination] = useState({});
  const [transactionsPagination, setTransactionsPagination] = useState({});

  // Check if user is admin
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!user || user.role !== 'admin') {
      showError('You do not have permission to access the admin dashboard');
      navigate('/');
      return;
    }
    
    // Fetch data on initial load
    fetchDashboardStats();
    fetchBooks();
    fetchUsers();
    fetchTransactions();
  }, [isAuthenticated, authLoading, user, navigate]);

  // API call to fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDashboardStats(response.data.data);
      } else {
        showError('Failed to load dashboard statistics');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      showError('Failed to load dashboard statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  // API call to fetch books
  const fetchBooks = async (page = 1) => {
    try {
      setLoadingBooks(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/books`, {
        params: { page, limit: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setBooks(response.data.data);
        setBooksPagination({
          page: response.data.pagination.page,
          totalPages: response.data.pagination.totalPages,
          total: response.data.total
        });
      } else {
        showError('Failed to load books');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      showError('Failed to load books');
    } finally {
      setLoadingBooks(false);
    }
  };

  // API call to fetch users
  const fetchUsers = async (page = 1) => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users`, {
        params: { page, limit: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUsers(response.data.data);
        setUsersPagination({
          page: response.data.pagination.page,
          totalPages: response.data.pagination.totalPages,
          total: response.data.total
        });
      } else {
        showError('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // API call to fetch transactions
  const fetchTransactions = async (page = 1) => {
    try {
      setLoadingTransactions(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/transactions`, {
        params: { page, limit: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setTransactions(response.data.data);
        setTransactionsPagination({
          page: response.data.pagination.page,
          totalPages: response.data.pagination.totalPages,
          total: response.data.total
        });
      } else {
        showError('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showError('Failed to load transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Change book status
  const handleUpdateBookStatus = async (bookId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/admin/books/${bookId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showSuccess(`Book status updated to ${status}`);
        fetchBooks(booksPage); // Refresh books data
      } else {
        showError('Failed to update book status');
      }
    } catch (error) {
      console.error('Error updating book status:', error);
      showError('Failed to update book status');
    }
  };

  // Delete book
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/admin/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showSuccess('Book deleted successfully');
        fetchBooks(booksPage); // Refresh books data
      } else {
        showError('Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      showError('Failed to delete book');
    }
  };

  // Update transaction status
  const handleUpdateTransactionStatus = async (transactionId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/admin/transactions/${transactionId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showSuccess(`Transaction status updated to ${status}`);
        fetchTransactions(transactionsPage); // Refresh transactions data
      } else {
        showError('Failed to update transaction status');
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      showError('Failed to update transaction status');
    }
  };

  // Pagination handlers
  const handleBooksPageChange = (page) => {
    setBooksPage(page);
    fetchBooks(page);
  };

  const handleUsersPageChange = (page) => {
    setUsersPage(page);
    fetchUsers(page);
  };

  const handleTransactionsPageChange = (page) => {
    setTransactionsPage(page);
    fetchTransactions(page);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render dashboard stats
  const renderDashboardStats = () => {
    if (loadingStats) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!dashboardStats) {
      return <div className="text-gray-600">No statistics available</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700">Users</h3>
          <p className="text-3xl font-bold text-blue-600">{dashboardStats.counts.users}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700">Books</h3>
          <p className="text-3xl font-bold text-green-600">{dashboardStats.counts.books}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700">Transactions</h3>
          <p className="text-3xl font-bold text-purple-600">{dashboardStats.counts.transactions}</p>
        </div>
      </div>
    );
  };

  // Render pagination controls
  const renderPagination = (pagination, onPageChange) => {
    if (!pagination || !pagination.totalPages) return null;
    
    const pages = [];
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;
    
    // Always show first page, last page, current page, and 1 page before and after current
    const pageNumbers = new Set();
    pageNumbers.add(1);
    pageNumbers.add(totalPages);
    pageNumbers.add(currentPage);
    if (currentPage > 1) pageNumbers.add(currentPage - 1);
    if (currentPage < totalPages) pageNumbers.add(currentPage + 1);
    
    // Convert set to sorted array
    const sortedPages = Array.from(pageNumbers).sort((a, b) => a - b);
    
    // Add ellipsis where needed
    let lastPage = 0;
    for (const page of sortedPages) {
      if (lastPage && page > lastPage + 1) {
        pages.push(<span key={`ellipsis-${lastPage}`} className="px-3 py-1">...</span>);
      }
      pages.push(
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-blue-600 hover:bg-blue-100'
          }`}
        >
          {page}
        </button>
      );
      lastPage = page;
    }
    
    return (
      <div className="flex justify-center items-center space-x-1 mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-100'
          }`}
        >
          Previous
        </button>
        {pages}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-100'
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      
      {renderDashboardStats()}

      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${
              activeTab === 'books'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('books')}
          >
            Books
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 'transactions'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
        </div>
      </div>

      {activeTab === 'books' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">All Books</h2>
            <span className="text-gray-600">Total: {booksPagination.total || 0}</span>
          </div>
          
          {loadingBooks ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {books.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p className="text-xl">No books available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {books.map(book => (
                        <tr key={book._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link to={`/books/${book._id}`} className="text-blue-600 hover:underline">
                              {book.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4">{book.author}</td>
                          <td className="px-6 py-4">${book.price.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              book.status === 'available'
                                ? 'bg-green-100 text-green-800'
                                : book.status === 'sold'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {book.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {book.seller ? book.seller.name : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleUpdateBookStatus(book._id, 'available')}
                                className="text-green-600 hover:text-green-900"
                                disabled={book.status === 'available'}
                              >
                                Set Available
                              </button>
                              <span>•</span>
                              <button 
                                onClick={() => handleDeleteBook(book._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {renderPagination(booksPagination, handleBooksPageChange)}
            </>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">All Users</h2>
            <span className="text-gray-600">Total: {usersPagination.total || 0}</span>
          </div>
          
          {loadingUsers ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p className="text-xl">No users found</p>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Verified
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isEmailVerified ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-red-600">✗</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {renderPagination(usersPagination, handleUsersPageChange)}
            </>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">All Transactions</h2>
            <span className="text-gray-600">Total: {transactionsPagination.total || 0}</span>
          </div>
          
          {loadingTransactions ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p className="text-xl">No transactions found</p>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Book
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Buyer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seller
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map(transaction => (
                        <tr key={transaction._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {transaction.book ? (
                              <Link to={`/books/${transaction.book._id}`} className="text-blue-600 hover:underline">
                                {transaction.book.title}
                              </Link>
                            ) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {transaction.buyer ? transaction.buyer.name : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {transaction.seller ? transaction.seller.name : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : transaction.status === 'refunded'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {transaction.status !== 'completed' && (
                              <button 
                                onClick={() => handleUpdateTransactionStatus(transaction._id, 'completed')}
                                className="text-green-600 hover:text-green-900 mr-2"
                              >
                                Complete
                              </button>
                            )}
                            {transaction.status !== 'refunded' && transaction.status === 'completed' && (
                              <button 
                                onClick={() => handleUpdateTransactionStatus(transaction._id, 'refunded')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Refund
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {renderPagination(transactionsPagination, handleTransactionsPageChange)}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 