# Book Marketplace

A full-stack web application for buying and selling books online. Built with React, Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Role-based access control (Admin/User)
- Book listing and browsing
- Secure payment processing with Stripe
- User dashboard for managing books and transactions
- Admin dashboard for platform management
- Responsive design

## Project Structure

- `/frontend` - React frontend application
- `/server` - Node.js/Express backend API

## Prerequisites

- Node.js (v14+)
- MongoDB
- Stripe account
- Cloudinary account (for image uploads)

## Getting Started

### Setting up the Backend

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your actual configuration values.

5. Start the development server:
   ```
   npm run dev
   ```

### Setting up the Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your actual configuration values.

5. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables

### Backend (Server)

Key environment variables you'll need to set in the server `.env` file:

- `PORT` - Server port
- `NODE_ENV` - Environment (development, production)
- `MONGODB_URI` - MongoDB connection URI
- `JWT_SECRET` - Secret key for JWT authentication
- `JWT_EXPIRE` - JWT token expiration
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `CLOUDINARY_*` - Cloudinary credentials

### Frontend

Key environment variables you'll need to set in the frontend `.env` file:

- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `VITE_API_URL` - Backend API URL

## Deployment

Before deploying:

1. Make sure to set up proper `.env` files for both frontend and backend
2. Ensure all sensitive information is kept secure and not committed to the repository
3. Set the appropriate `NODE_ENV` value to `production`

## Security Notice

This repository does not include any sensitive information such as API keys, secrets, or credentials. You must configure your own environment variables for the application to function properly.

## License

[MIT](LICENSE) 