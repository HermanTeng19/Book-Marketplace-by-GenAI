import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '../config';

// Initialize Stripe with the publishable key from config
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const StripeProvider = ({ children, clientSecret }) => {
  // Base appearance options
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#3b82f6', // Tailwind blue-500
      colorBackground: '#ffffff',
      colorText: '#1f2937', // Tailwind gray-800
      colorDanger: '#ef4444', // Tailwind red-500
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px',
    },
  };

  // Configure options based on whether we have a clientSecret
  const options = clientSecret
    ? {
        clientSecret,
        appearance,
      }
    : {
        appearance,
        // These options are used when using Stripe Elements without PaymentIntent
        // like when using CardElement directly
        mode: 'payment',
        currency: 'usd',
        amount: 0, // Will be set later
      };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProvider; 