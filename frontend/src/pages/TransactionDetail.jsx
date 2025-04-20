import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const TransactionDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchTransaction();
  }, [id, isAuthenticated, navigate]);
  
  const fetchTransaction = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userService.getTransactionById(id);
      if (result.success) {
        setTransaction(result.transaction);
      } else {
        setError(result.error || 'Failed to load transaction details');
        showError(result.error || 'Failed to load transaction details');
      }
    } catch (error) {
      setError('An error occurred while fetching transaction details');
      showError('An error occurred while fetching transaction details');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <Link 
          to="/dashboard"
          className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  if (!transaction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8 text-gray-600">
          <p className="text-xl">Transaction not found</p>
        </div>
        <Link 
          to="/dashboard"
          className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  const isBuyer = transaction.buyer?._id === user?.id;
  const transactionType = isBuyer ? 'Purchase' : 'Sale';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Transaction Details
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(transaction.status)}`}>
              {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">ID: {transaction._id}</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Book Information</h2>
              {transaction.book ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    {transaction.book.coverImage && (
                      <img 
                        src={transaction.book.coverImage} 
                        alt={transaction.book.title} 
                        className="w-24 h-32 object-cover rounded mr-4"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-lg">{transaction.book.title}</h3>
                      <p className="text-gray-600">by {transaction.book.author}</p>
                      
                      <div className="mt-2 space-y-2">
                        <Link 
                          to={`/books/${transaction.book._id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm inline-block"
                        >
                          View Book Details
                        </Link>
                        
                        {transaction.status === 'completed' && isBuyer && transaction.book.pdfFile && (
                          <a 
                            href={transaction.book.pdfFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 text-sm block"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Book
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Book information not available</p>
              )}
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-3">Transaction Details</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className={`font-medium ${isBuyer ? 'text-red-600' : 'text-green-600'}`}>
                      {transactionType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium">${transaction.amount?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium capitalize">{transaction.paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Parties Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Seller</h3>
                {transaction.seller ? (
                  <div>
                    <p>{transaction.seller.name}</p>
                    <p className="text-gray-600 text-sm">{transaction.seller.email}</p>
                  </div>
                ) : (
                  <p className="text-gray-600">Seller information not available</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Buyer</h3>
                {transaction.buyer ? (
                  <div>
                    <p>{transaction.buyer.name}</p>
                    <p className="text-gray-600 text-sm">{transaction.buyer.email}</p>
                  </div>
                ) : (
                  <p className="text-gray-600">Buyer information not available</p>
                )}
              </div>
            </div>
          </div>
          
          {transaction.status === 'failed' && (
            <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="font-medium text-red-800 mb-2">Payment Failed</h3>
              <p className="text-red-700">
                {transaction.error || 'The payment for this transaction was unsuccessful.'}
              </p>
            </div>
          )}
          
          {transaction.status === 'refunded' && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-2">Refund Information</h3>
              <p className="text-gray-700">
                This transaction has been refunded.
              </p>
              {transaction.refundReason && (
                <p className="text-gray-600 mt-2">
                  <span className="font-medium">Reason:</span> {transaction.refundReason}
                </p>
              )}
              {transaction.refundDate && (
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Refund Date:</span> {formatDate(transaction.refundDate)}
                </p>
              )}
            </div>
          )}
          
          {transaction.status === 'completed' && transaction.receiptUrl && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Payment Receipt</h2>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-green-700 mb-3">
                  Your payment was successfully processed.
                </p>
                <a 
                  href={transaction.receiptUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View Receipt
                </a>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <Link 
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail; 