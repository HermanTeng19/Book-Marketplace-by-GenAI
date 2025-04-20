import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePaymentProcessing from '../hooks/usePaymentProcessing';
import StripeProvider from './StripeProvider';
import PaymentForm from './PaymentForm';

const PaymentModal = ({ book, isOpen, onClose }) => {
  const [clientSecret, setClientSecret] = useState('');
  const { isProcessing, error, createPaymentIntent } = usePaymentProcessing();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && book) {
      initializePayment();
    }
  }, [isOpen, book]);

  const initializePayment = async () => {
    if (!book || !book._id) return;
    
    const result = await createPaymentIntent(book._id);
    
    if (result.success) {
      setClientSecret(result.clientSecret);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const handleSuccess = (transaction) => {
    onClose();
    navigate(`/transactions/${transaction._id}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              disabled={isProcessing}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {isProcessing && !clientSecret ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error && !clientSecret ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Error</h3>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : clientSecret ? (
              <StripeProvider clientSecret={clientSecret}>
                <PaymentForm
                  clientSecret={clientSecret}
                  bookId={book._id}
                  bookTitle={book.title}
                  amount={book.price}
                  onSuccess={handleSuccess}
                  onCancel={handleClose}
                />
              </StripeProvider>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 