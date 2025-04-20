import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import usePaymentProcessing from '../hooks/usePaymentProcessing';
import { useNotification } from '../context/NotificationContext';

// Helper for providing user-friendly error messages
const getCardErrorMessage = (code) => {
  switch (code) {
    case 'card_declined':
      return 'The card was declined. Please try another card.';
    case 'expired_card':
      return 'The card has expired. Please try another card.';
    case 'incorrect_cvc':
      return 'The CVC code is incorrect. Please check and try again.';
    case 'insufficient_funds':
      return 'The card has insufficient funds. Please try another card.';
    case 'invalid_expiry_year':
    case 'invalid_expiry_month':
      return 'The expiration date is invalid. Please check and try again.';
    case 'incorrect_number':
    case 'invalid_number':
      return 'The card number is invalid. For testing, use 4242 4242 4242 4242.';
    case 'incomplete_number':
      return 'The card number is incomplete. Please enter the full 16-digit card number.';
    case 'incomplete_cvc':
      return 'The CVC is incomplete. Please enter all 3 digits.';
    case 'incomplete_expiry':
      return 'The expiry date is incomplete. Please enter both month and year.';
    case 'payment_intent_authentication_failure':
      return 'Authentication failed. Please try again.';
    default:
      return code 
        ? `Card error: ${code}` 
        : 'An unexpected error occurred during payment. Please try again.';
  }
};

const PaymentForm = ({ clientSecret, bookId, bookTitle, amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { showError } = useNotification();
  const { isProcessing, error, confirmPaymentWithServer, reportFailedPayment, goToTransactionDetails } = usePaymentProcessing();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardError, setCardError] = useState('');

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }
  }, [stripe, clientSecret]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsSubmitting(true);
    setCardError('');

    try {
      // Confirm the payment with Stripe
      console.log("Confirming payment with Stripe using client secret:", clientSecret?.substring(0, 10) + "...");
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Book Marketplace User', // You could collect this from the user
          },
        }
      });

      console.log("Stripe response:", { error, paymentIntentStatus: paymentIntent?.status });
      
      if (error) {
        console.error("Payment error details:", {
          code: error.code,
          type: error.type,
          message: error.message,
          declineCode: error.decline_code
        });

        const errorMessage = getCardErrorMessage(error.code) || error.message || 'An error occurred during payment processing';
        setCardError(errorMessage);
        showError(errorMessage);
        
        // Notify the backend about the failed payment
        const paymentIntentId = clientSecret.split('_secret_')[0];
        await reportFailedPayment(paymentIntentId, errorMessage);
      } else if (paymentIntent.status === 'succeeded') {
        console.log("Payment succeeded, confirming with backend. PaymentIntent ID:", paymentIntent.id);
        // Payment succeeded, confirm with backend
        const result = await confirmPaymentWithServer(paymentIntent.id);
        console.log("Backend confirmation result:", result);
        
        if (result.success) {
          if (onSuccess) {
            onSuccess(result.transaction);
          } else {
            // Navigate to transaction detail page
            goToTransactionDetails(result.transaction._id);
          }
        }
      } else {
        console.warn(`Unexpected payment status: ${paymentIntent.status}`, paymentIntent);
        setCardError(`Payment status: ${paymentIntent.status}. Please try again.`);
        showError(`Payment status: ${paymentIntent.status}. Please try again.`);
      }
    } catch (stripeError) {
      console.error('Unhandled Stripe error:', stripeError);
      setCardError('An unexpected error occurred during payment');
      showError('An unexpected error occurred during payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isProcessing || isSubmitting;
  const errorMessage = error || cardError;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Complete Your Purchase</h2>
      <div className="mb-4 p-4 bg-gray-50 rounded-md">
        <p className="text-gray-700 font-medium">{bookTitle}</p>
        <p className="text-gray-900 font-bold text-xl mt-1">${parseFloat(amount).toFixed(2)}</p>
      </div>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border border-gray-300 p-3 rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          <div className="mt-2 p-2 bg-blue-50 rounded-md text-xs text-blue-700">
            <p className="font-medium">📌 Test Card Information:</p>
            <ul className="mt-1 ml-4 list-disc">
              <li>Card number: 4242 4242 4242 4242</li>
              <li>Expiry date: Any future date (MM/YY)</li>
              <li>CVC: Any 3 digits</li>
              <li>ZIP: Any 5 digits</li>
            </ul>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !stripe}
            className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm; 