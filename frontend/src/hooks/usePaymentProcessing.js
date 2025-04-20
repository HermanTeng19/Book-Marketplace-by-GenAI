import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { transactionService } from '../services/api';

const usePaymentProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  // Create a payment intent for a book
  const createPaymentIntent = async (bookId) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await transactionService.createPaymentIntent(bookId);
      
      if (result.success) {
        return {
          success: true,
          clientSecret: result.clientSecret,
          paymentIntentId: result.paymentIntentId
        };
      } else {
        setError(result.error || 'Failed to initialize payment');
        showError(result.error || 'Failed to initialize payment');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = 'An error occurred while initializing payment';
      setError(errorMessage);
      showError(errorMessage);
      console.error('Payment intent error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm a payment with the server after Stripe processes it
  const confirmPaymentWithServer = async (paymentIntentId) => {
    setIsProcessing(true);
    setError(null);
    
    console.log(`Attempting to confirm payment with server for intent: ${paymentIntentId}`);
    
    try {
      console.log('Calling confirmPayment API...');
      const result = await transactionService.confirmPayment(paymentIntentId);
      console.log('API response:', result);
      
      if (result.success) {
        console.log('Payment confirmed successfully:', result.data);
        showSuccess('Payment successful! You now own this book.');
        return {
          success: true,
          transaction: result.data
        };
      } else {
        const errorMessage = result.error || 'Failed to confirm payment with server';
        console.error('Server confirmation failed:', errorMessage);
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('Confirmation API error:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        responseData: err.response?.data
      });
      const errorMessage = 'Error confirming payment with server';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  // Report a failed payment to the server
  const reportFailedPayment = async (paymentIntentId, errorMessage) => {
    try {
      await transactionService.notifyPaymentFailed(paymentIntentId, errorMessage);
      return { success: true };
    } catch (err) {
      console.error('Failed to notify server about payment failure:', err);
      return { success: false, error: 'Failed to report payment failure' };
    }
  };

  // Navigate to the transaction details page after successful payment
  const goToTransactionDetails = (transactionId) => {
    navigate(`/transactions/${transactionId}`);
  };

  return {
    isProcessing,
    error,
    createPaymentIntent,
    confirmPaymentWithServer,
    reportFailedPayment,
    goToTransactionDetails,
  };
};

export default usePaymentProcessing; 