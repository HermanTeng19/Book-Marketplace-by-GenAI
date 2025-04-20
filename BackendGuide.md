# Backend Guide

## Project Overview

This project is a Book Marketplace platform where users can upload books in PDF format for others to purchase. It is built using the MERN (MongoDB, Express, React, Node.js), with additional technologies like Vite, Stripe for payments, and Tailwind CSS for styling. The system handles user authentication, file uploads, secure payments, and a clean user interface.

## Backend Features

_User Authentication_

- JWT-based authentication for secure login and signup.
- Password hashing using bcrypt for secure storage.
  
_Book Management_

- Users can upload books in PDF format.
- File uploads handled with Multer and stored on cloud platforms like Cloudinary or AWS S3.
- Mongoose models for managing users and books.

_Payment Processing_

- Stripe integration for handling payments and transactions.
- Webhooks to listen for Stripe payment events (e.g., successful payments).

_Data Validation and Security_

- Input validation using Express Validator for secure data entry.
- CORS handling for frontend-backend communication.

_API Endpoints_

- RESTful API for book management (create, read, update, delete books).
- Endpoints for user registration, login, and profile management.
- Payment-related endpoints to initiate and confirm transactions via Stripe.

_Admin Controls_

- Admin panel for viewing users, books, and transactions.
- Admin capabilities for managing users and content.

**Folder Structure**

├── server/                         # Node.js + Express backend
│   ├── config/                     # DB config, Stripe keys, etc.
│   ├── controllers/                # Route logic
│   ├── middlewares/               # Auth, error handling, etc.
│   ├── models/                     # Mongoose models
│   ├── routes/                    # Express route definitions
│   ├── utils/                      # Helpers (e.g., validators)
│   ├── uploads/                    # Temp/local PDF storage (if not using cloud)
│   ├── server.js                   # Entry point for backend
│   ├── .env                        # Backend environment variables
│   └── package.json                # Backend dependencies

## Resources to use

_Backend Setup_

- https://www.mongodb.com/docs/
- https://expressjs.com/en/starter/installing.html
- https://reactjs.org/docs/getting-started.html
- https://nodejs.org/en/docs/

_Authentication_

- https://jwt.io/introduction (JWT Authentication in Node.js)
- https://www.npmjs.com/package/bcrypt (Bcrypt for Password Hashing)

_File Upload_
https://www.npmjs.com/package/multer

- https://cloudinary.com/documentation

_Payments_

- https://www.npmjs.com/package/stripe