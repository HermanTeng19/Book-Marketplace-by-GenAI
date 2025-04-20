# Stripe Integration in Book Marketplace

This document explains how the Stripe payment processing is implemented in the Book Marketplace application.

## Overview

The Book Marketplace uses Stripe to process secure payments when users purchase books. The implementation follows Stripe's recommended flow for handling payment intents:

1. Create a payment intent on the server
2. Collect payment details on the client using Stripe Elements
3. Confirm the payment on the client with Stripe.js
4. Confirm the completed payment with the server to update the database

## Components and Files

### Frontend Components

- `PaymentForm.jsx`: Displays the Stripe CardElement and handles payment submission
- `PaymentModal.jsx`: Modal that contains the payment form and manages payment state
- `StripeProvider.jsx`: Initializes Stripe and provides the Stripe context to components

### Custom Hooks

- `usePaymentProcessing.js`: Custom hook that centralizes payment logic

### API Services

- `api.js`: Contains methods for interacting with the backend payment endpoints

### Backend Controllers and Routes

- `transactionController.js`: Handles payment intent creation, confirmation, and transaction management
- `transactions.js` (routes): Defines the API endpoints for payment processing

## Payment Flow

1. **Initiate Purchase**:
   - User clicks "Purchase Now" on a book details page
   - The application opens a payment modal

2. **Create Payment Intent**:
   - The frontend calls the `createPaymentIntent` API with the book ID
   - The backend verifies the book is available and the user is not the seller
   - The backend creates a Stripe payment intent and returns the client secret

3. **Collect Payment Details**:
   - The frontend displays the Stripe CardElement in the payment form
   - User enters their card details

4. **Process Payment**:
   - User submits the payment form
   - The frontend calls `stripe.confirmCardPayment()` with the client secret
   - Stripe processes the payment and returns the result

5. **Complete Transaction**:
   - If payment is successful, the frontend calls the `confirmPayment` API
   - The backend verifies the payment with Stripe and updates the database:
     - Creates a transaction record
     - Updates the book status to "sold"
     - Adds the book to the buyer's purchased books
     - Adds the transaction to both buyer's and seller's transaction history

6. **Handle Results**:
   - On success, the user is redirected to the transaction detail page
   - On failure, an error message is displayed and the backend is notified

## Testing

In test mode, you can use Stripe's test card numbers to simulate different payment scenarios:

- **Successful payment**: 4242 4242 4242 4242
- **Authentication required**: 4000 0027 6000 3184
- **Payment declined**: 4000 0000 0000 0002

For all test cards, you can use:
- Any future expiration date
- Any 3-digit CVC
- Any ZIP code

## Error Handling

The implementation includes detailed error handling:

- User-friendly error messages for common payment errors
- Proper error logging on both frontend and backend
- Notification of the backend about failed payments to maintain accurate records

## Security Considerations

- Sensitive card data is never sent to our server
- Payment confirmation is verified on the server side
- Authentication and authorization checks are performed for all payment operations
- Stripe webhooks can be configured for additional security and reliability 