import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookService, userService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import BookGrid from '../components/BookGrid';

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();
  
  const [userBooks, setUserBooks] = useState([]);
  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('myBooks');
  
  const [isLoadingMyBooks, setIsLoadingMyBooks] = useState(false);
  const [isLoadingPurchased, setIsLoadingPurchased] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  
  const [myBooksError, setMyBooksError] = useState(null);
  const [purchasedError, setPurchasedError] = useState(null);
  const [transactionsError, setTransactionsError] = useState(null);

  // Wait for auth to complete before checking authentication
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    console.log('User authenticated, fetching dashboard data');
    fetchUserBooks();
    fetchPurchasedBooks();
    fetchTransactions();
  }, [isAuthenticated, authLoading, navigate]);

  const fetchUserBooks = async () => {
    setIsLoadingMyBooks(true);
    setMyBooksError(null);
    
    try {
      console.log('Fetching user books...');
      const result = await bookService.getUserBooks();
      console.log('User books result:', result);
      
      if (result.success) {
        setUserBooks(result.books || []);
      } else {
        setMyBooksError(result.error || 'Failed to load your books');
        showError(result.error || 'Failed to load your books');
      }
    } catch (error) {
      console.error('Error in fetchUserBooks:', error);
      setMyBooksError('An error occurred while fetching your books');
      showError('An error occurred while fetching your books');
    } finally {
      setIsLoadingMyBooks(false);
    }
  };

  const fetchPurchasedBooks = async () => {
    setIsLoadingPurchased(true);
    setPurchasedError(null);
    
    try {
      console.log('Fetching purchased books...');
      const result = await bookService.getPurchasedBooks();
      console.log('Purchased books result:', result);
      
      if (result.success) {
        setPurchasedBooks(result.books || []);
      } else {
        setPurchasedError(result.error || 'Failed to load purchased books');
        showError(result.error || 'Failed to load purchased books');
      }
    } catch (error) {
      console.error('Error in fetchPurchasedBooks:', error);
      setPurchasedError('An error occurred while fetching purchased books');
      showError('An error occurred while fetching purchased books');
    } finally {
      setIsLoadingPurchased(false);
    }
  };

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    setTransactionsError(null);
    
    try {
      console.log('Fetching transactions...');
      const result = await userService.getTransactions();
      console.log('Transactions result:', result);
      
      if (result.success) {
        setTransactions(result.transactions || []);
      } else {
        setTransactionsError(result.error || 'Failed to load transactions');
        showError(result.error || 'Failed to load transactions');
      }
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
      setTransactionsError('An error occurred while fetching transactions');
      showError('An error occurred while fetching transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Show loading state if still checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderTransactions = () => {
    if (isLoadingTransactions) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (transactionsError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{transactionsError}</span>
        </div>
      );
    }

    if (!transactions || transactions.length === 0) {
      return (
        <div className="text-center py-8 text-gray-600">
          <p className="text-xl">No transactions found</p>
        </div>
      );
    }

    return (
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Book</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">{transaction.book ? transaction.book.title : 'N/A'}</td>
                <td className="px-4 py-2">${transaction.amount.toFixed(2)}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : transaction.status === 'refunded'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <Link 
                    to={`/transactions/${transaction._id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
        <Link 
          to="/upload" 
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Upload New Book
        </Link>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('myBooks')}
            className={`py-4 px-1 ${
              activeTab === 'myBooks'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } font-medium text-sm sm:text-base`}
          >
            My Books
          </button>
          <button
            onClick={() => setActiveTab('purchased')}
            className={`py-4 px-1 ${
              activeTab === 'purchased'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } font-medium text-sm sm:text-base`}
          >
            Purchased Books
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-4 px-1 ${
              activeTab === 'transactions'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } font-medium text-sm sm:text-base`}
          >
            Transactions
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'myBooks' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Books You're Selling</h2>
            <BookGrid 
              books={userBooks} 
              loading={isLoadingMyBooks}
              error={myBooksError}
              emptyMessage="You haven't listed any books for sale yet."
              browseLink="/upload"
              browseLinkText="Upload a Book"
              context="myBooks"
            />
          </div>
        )}

        {activeTab === 'purchased' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Books You've Purchased</h2>
            <BookGrid 
              books={purchasedBooks}
              loading={isLoadingPurchased}
              error={purchasedError}
              emptyMessage="You haven't purchased any books yet."
              context="purchasedBooks"
            />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Transactions</h2>
            {renderTransactions()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 