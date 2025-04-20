# Book Marketplace API Endpoints

This document provides a list of all available endpoints in the Book Marketplace API.

## Authentication Endpoints
- **POST** `/api/auth/register`
  - Register a new user
  - Body: `{ name, email, password }`
  - Returns: User object and JWT token

- **POST** `/api/auth/login`
  - Log in an existing user
  - Body: `{ email, password }`
  - Returns: User object and JWT token

- **POST** `/api/auth/logout`
  - Log out the current user
  - Headers: `Authorization: Bearer [token]`
  - Returns: Success message
  - Note: This blacklists the token, requiring the user to login again

- **PUT** `/api/auth/change-password`
  - Change the current user's password
  - Headers: `Authorization: Bearer [token]`
  - Body: `{ currentPassword, newPassword, confirmPassword }`
  - Returns: Success message and new JWT token
  - Note: This invalidates the current token and issues a new one

- **POST** `/api/auth/forgot-password`
  - Request password reset
  - Body: `{ email }`
  - Returns: Success message and reset token (in production, would send email)

- **PUT** `/api/auth/reset-password/:token`
  - Reset password using token
  - Params: `token` - Reset token sent to email
  - Body: `{ password, confirmPassword }`
  - Returns: Success message

- **GET** `/api/auth/verify-email/:token`
  - Verify user email
  - Params: `token` - Verification token
  - Returns: Success message

- **GET** `/api/auth/me`
  - Get current user profile
  - Headers: `Authorization: Bearer [token]`
  - Returns: User object

## User Management Endpoints

### User Profile Endpoints (Authentication Required)
- **GET** `/api/users/profile`
  - Get complete profile of current user
  - Headers: `Authorization: Bearer [token]`
  - Returns: Detailed user object with populated references (purchased books, selling books, transactions)

- **GET** `/api/users/me`
  - Get basic profile of current user
  - Headers: `Authorization: Bearer [token]`
  - Returns: User object

- **PUT** `/api/users/profile`
  - Update user profile
  - Headers: `Authorization: Bearer [token]`
  - Body: `{ name, bio, profileImage }`
  - Returns: Updated user object

- **PUT** `/api/users/wallet`
  - Update user wallet
  - Headers: `Authorization: Bearer [token]`
  - Body: `{ amount, currency }`
  - Returns: Updated wallet object

- **GET** `/api/users/purchased-books`
  - Get books purchased by current user
  - Headers: `Authorization: Bearer [token]`
  - Returns: Array of book objects

- **GET** `/api/users/selling-books`
  - Get books being sold by current user
  - Headers: `Authorization: Bearer [token]`
  - Returns: Array of book objects

- **GET** `/api/users/transactions`
  - Get transactions for current user
  - Headers: `Authorization: Bearer [token]`
  - Returns: Array of transaction objects

### Admin Endpoints (Admin Role Required)

#### Admin Dashboard
- **GET** `/api/admin/dashboard`
  - Get dashboard statistics
  - Headers: `Authorization: Bearer [token]`
  - Returns: Counts, recent users, recent transactions, revenue stats, book stats

#### User Management
- **GET** `/api/admin/users`
  - Get all users with pagination, filtering, and search
  - Headers: `Authorization: Bearer [token]`
  - Query Parameters:
    - `page`: Page number (default: 1)
    - `limit`: Results per page (default: 10)
    - `role`: Filter by role (user/admin)
    - `isEmailVerified`: Filter by email verification status
    - `search`: Search by name or email
  - Returns: Array of user objects with pagination details

- **GET** `/api/users/:id`
  - Get single user by ID
  - Headers: `Authorization: Bearer [token]`
  - Params: `id` - User ID
  - Returns: User object

- **DELETE** `/api/users/:id`
  - Delete user by ID
  - Headers: `Authorization: Bearer [token]`
  - Params: `id` - User ID
  - Returns: Success message

- **PUT** `/api/users/:id/role`
  - Update user role
  - Headers: `Authorization: Bearer [token]`
  - Params: `id` - User ID
  - Body: `{ role }` - Either 'user' or 'admin'
  - Returns: Updated user object

#### Book Management
- **GET** `/api/admin/books`
  - Get all books with pagination, filtering, and search
  - Headers: `Authorization: Bearer [token]`
  - Query Parameters:
    - `page`: Page number (default: 1)
    - `limit`: Results per page (default: 10)
    - `status`: Filter by status (available/sold/unavailable)
    - `category`: Filter by category
    - `search`: Search by title, author, or description
  - Returns: Array of book objects with pagination details

- **PUT** `/api/admin/books/:id/status`
  - Update book status
  - Headers: `Authorization: Bearer [token]`
  - Params: `id` - Book ID
  - Body: `{ status }` - Either 'available', 'sold', or 'unavailable'
  - Returns: Updated book object

- **DELETE** `/api/admin/books/:id`
  - Delete book
  - Headers: `Authorization: Bearer [token]`
  - Params: `id` - Book ID
  - Returns: Success message

#### Transaction Management
- **GET** `/api/admin/transactions`
  - Get all transactions with pagination, filtering, and search
  - Headers: `Authorization: Bearer [token]`
  - Query Parameters:
    - `page`: Page number (default: 1)
    - `limit`: Results per page (default: 10)
    - `status`: Filter by status (pending/completed/failed/refunded)
    - `paymentMethod`: Filter by payment method
    - `startDate`: Filter by date range start
    - `endDate`: Filter by date range end
    - `calculateTotal`: Whether to calculate total amount (true/false)
  - Returns: Array of transaction objects with pagination details

- **PUT** `/api/admin/transactions/:id/status`
  - Update transaction status
  - Headers: `Authorization: Bearer [token]`
  - Params: `id` - Transaction ID
  - Body: `{ status }` - Either 'pending', 'completed', 'failed', or 'refunded'
  - Returns: Updated transaction object

## Base API Endpoints
- **GET** `/`
  - Base endpoint
  - Returns: API status and timestamp

- **GET** `/api/test`
  - Test endpoint
  - Returns: Server time and environment

## Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

### Logout
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Change Password
```bash
curl -X PUT http://localhost:8000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"currentPassword": "oldPassword123", "newPassword": "newPassword123", "confirmPassword": "newPassword123"}'
```

### Get current user profile
```bash
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update user profile
```bash
curl -X PUT http://localhost:8000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "John Smith", "bio": "Book lover and collector"}'
```

### Admin: Get dashboard statistics
```bash
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Admin: Get all books with filtering
```bash
curl -X GET "http://localhost:8000/api/admin/books?page=1&limit=20&status=available&search=programming" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Admin: Update transaction status
```bash
curl -X PUT http://localhost:8000/api/admin/transactions/123456/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{"status": "completed"}'
```

Note: All protected routes require a valid JWT token in the Authorization header.

### Book Endpoints (Cloudinary Integration)

Book endpoints now use Cloudinary for file storage. Files are uploaded to Cloudinary when creating or updating books, and URLs are stored in the database.

#### Public Book Endpoints
- **GET** `/api/books`
  - Get all available books with filtering, sorting, and pagination
  - Query Parameters:
    - `page`: Page number (default: 1)
    - `limit`: Results per page (default: 10)
    - `category`: Filter by category
    - `status`: Filter by status (available/sold/unavailable) - requires auth for non-available status
    - `minPrice`: Filter by minimum price
    - `maxPrice`: Filter by maximum price
    - `sort`: Sort by (price-asc/price-desc/newest/rating)
    - `search`: Search by title, author, or description
  - Returns: Array of book objects with pagination details

- **GET** `/api/books/:id`
  - Get single book by ID
  - Params: `id` - Book ID
  - Returns: Book object with seller and review details
  - Note: Non-available books can only be accessed by the seller or admin users

- **GET** `/api/books/:id/reviews`
  - Get all reviews for a book
  - Params: `id` - Book ID
  - Returns: Array of review objects with user details and average rating

#### Protected Book Endpoints (Require Authentication)

- **POST** `/api/books`
  - Create a new book listing with Cloudinary file uploads
  - Headers: `Authorization: Bearer [token]`
  - Body: `multipart/form-data` with fields:
    - `title`: Book title (required)****
    - `author`: Book author (required)
    - `description`: Book description (required)
    - `price`: Book price (required, positive number)
    - `category`: Book category (required)
    - `tags`: Array of tags as JSON string (optional)
    - `coverImage`: Cover image file (required, will be uploaded to Cloudinary)
    - `pdfFile`: PDF file (required, will be uploaded to Cloudinary)
  - Returns: Created book object with Cloudinary URLs

- **PUT** `/api/books/:id`
  - Update a book listing (seller or admin only) with Cloudinary file uploads
  - Headers: `Authorization: Bearer [token]`
  - Params: `id` - Book ID
  - Body: `multipart/form-data` with fields (all optional):
    - `title`: Book title
    - `author`: Book author
    - `description`: Book description
    - `price`: Book price (positive number)
    - `category`: Book category
    - `tags`: Array of tags as JSON string
    - `status`: Book status (available/sold/unavailable)
    - `coverImage`: Cover image file (will be uploaded to Cloudinary)
    - `pdfFile`: PDF file (will be uploaded to Cloudinary)
  - Returns: Updated book object with Cloudinary URLs
  - Note: When updating files, old files will be automatically deleted from Cloudinary

- **DELETE** `/api/books/:id`
  - Delete a book listing (seller or admin only)
  - Headers: `Authorization: Bearer [token]`
  - Params: `id` - Book ID
  - Returns: Success message
  - Note: Book files will be automatically deleted from Cloudinary

- **POST** `/api/books/:id/reviews`

## Transaction Endpoints

### Payment and Transactions

| Method | Endpoint                              | Description                  | Access     |
|--------|---------------------------------------|------------------------------|------------|
| POST   | /api/transactions/create-payment-intent | Create a Stripe payment intent | Private    |
| POST   | /api/transactions/confirm-payment     | Confirm successful payment    | Private    |
| POST   | /api/transactions/payment-failed      | Record a failed payment       | Private    |
| GET    | /api/transactions                     | Get user's transactions      | Private    |
| GET    | /api/transactions/:id                 | Get transaction by ID        | Private    |
| POST   | /api/transactions/:id/refund          | Refund a transaction         | Admin      |