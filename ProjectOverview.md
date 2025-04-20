# Project Overview

This project is a Book Marketplace platform where users can upload books in PDF format for others to purchase. It is built using the MERN (MongoDB, Express, React, Node.js), with additional technologies like Vite, Stripe for payments, and Tailwind CSS for styling. The system handles user authentication, file uploads, secure payments, and a clean user interface.

## Backend Features

User Authentication

* JWT-based authentication for secure login and signup. 
* Password hashing using bcrypt for secure storage. 

Book Management

* Users can upload books in PDF format. 
* File uploads handled with Multer and stored on cloud platform like Cloudinary or AWS S3. 
* Mongoose models for managing users and books.

Payment Processing

* Stripe integration for handling payments and transactions.
* Webhooks to listen for Stripe payment events (e.g., successful payments).

Data Validation and Security 

* Input validation using Express Validator for secure data entry.
* CORS handling for frontend-backend communication.

API Endpoints

* RESTful API for book management (create, read, update, delete books).
* Endpoints for user registration, login, and profile management.
* Payment-related endpoints to initiate and confirm transactions via Stripe

Admin Controls

* Admin panel for viewing users, books, and transactions.
* Admin capabilities for managing users and content.

## Frontend Features

*User Authentication*

* Registration, login, and logout functionality with JWT stored in local storage or cookies.
* Protected routes using React Router DOM, accessible only after authentication.

*Book Upload*

* Drag-and-drop interface for uploading books (using react-drop zone).
* User interface for viewing uploaded books with details (title, description, price).

*Book Purchase*

* Integration with Stripe for users to purchase books.
* Purchase confirmation and display of receipt after successful transaction.

*Book Preview & Details*

* Users can preview book details (descriptions, price) before purchasing.
* Optional image preview or sample pages for users to view before buying.

*User Dashboard*

* A personal dashboard for users to manage their uploaded books and purchase history.
* Option to edit or delete uploaded books.

*Admin Dashboard*

* Admin panel for viewing users, books, and transactions.
* Admin capabilities for managing users and content.

*Responsive UI*

* Modern, responsive design using Tailwind CSS.
* Ant Design components for a polished and interactive UI (e.g., forms, buttons, tables).

*Context API for State Management*

* Centralized state management using React's Context API for user authentication and book data.

*Routing and Navigation*

* Navigation between different pages (Home, Upload Book, Book Details, Purchase, etc.) using React Router DOM.
* Public and private routes to control access based on authentication status.

*Notification and Alerts*

* Success and error notifications for user actions (e.g., upload successful, payment failed) using libraries like react-toastify.

## Current Folder Structure 

book-marketplace/
├── client/                         # React frontend (Vite)
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── assets/                 # Images, icons, etc.
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # React pages (e.g., Home, Login, Dashboard)
│   │   ├── context/                # Context API setup
│   │   ├── routes/                 # Route definitions
│   │   ├── services/               # API call functions
│   │   ├── utils/                  # Helper functions
│   │   ├── App.jsx                 # Root component
│   │   ├── main.jsx                # Vite entry point
│   │   └── index.css               # Tailwind base styles
│   ├── .env                        # Frontend environment variables
│   ├── vite.config.js              # Vite configuration
│   └── package.json                # Frontend dependencies
│
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
│
├── README.md                       # Project overview
├── .gitignore                      # Git ignore list
└── LICENSE                         # License file

## Resources to use

_MERN Stack Setup_

- https://www.mongodb.com/docs/
- https://expressjs.com/en/starter/installing.html
- https://reactjs.org/docs/getting-started.html
- https://nodejs.org/en/docs/

_Vite_

- https://vitejs.dev/guide/

_Authentication_

- https://jwt.io/introduction (JWT Authentication in Node.js)
- https://www.npmjs.com/package/bcrypt (Bcrypt for Password Hashing)

_File Upload_
https://www.npmjs.com/package/multer

- https://cloudinary.com/documentation

_Payments_

- https://stripe.com/docs/api

_Frontend UI_

- https://tailwindcss.com/docs
- https://ant.design/docs/react/introduce

_React Libraries_

- https://reactrouter.com/web/guides/quick-start 
- https://react.dev/blog/2023/03/16/introducing-react-dev
