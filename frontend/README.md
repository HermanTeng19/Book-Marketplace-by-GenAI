# Book Marketplace Frontend

This is the frontend for the Book Marketplace application.

## Features

- User authentication (login, register, password reset)
- Book browsing and filtering
- Book details view
- Book uploading and management
- User dashboard with purchased and selling books
- Secure payment processing with Stripe
- Transaction history and details

## Installation

1. Clone the repository
2. Navigate to the frontend directory: `cd frontend`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## Payment Processing

The application uses Stripe for secure payment processing. In test mode, you can use the following card details:

- **Card Number**: 4242 4242 4242 4242
- **Expiry Date**: Any future date (MM/YY)
- **CVC**: Any 3 digits
- **ZIP Code**: Any 5 digits

## Environment Variables

The application uses the following environment variables which can be configured in the `config/index.js` file:

- `API_URL`: Backend API endpoint
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key for the frontend

## Technologies Used

- React
- React Router
- Tailwind CSS
- Axios
- Stripe Elements and React Stripe JS

## Project Structure

- `src/components`: React components
- `src/context`: React context providers
- `src/hooks`: Custom React hooks
- `src/pages`: Page components
- `src/services`: API service functions
- `src/config`: Application configuration
