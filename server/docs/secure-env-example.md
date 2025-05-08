# Secure Environment Variables Example

This document provides a template for setting up secure environment variables, including those needed for admin user configuration.

## Server .env Template

```env
# Server Configuration
PORT=8000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/book-marketplace

# JWT Configuration
# Generate a strong secret with: openssl rand -base64 64
JWT_SECRET=your_very_strong_jwt_secret_key_here
JWT_EXPIRE=24h

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here

# File Upload Configuration - Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin User Configuration
# These are used by the adminSeeder.js script
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_NAME=Administrator
# Generate a strong password with: openssl rand -base64 12
ADMIN_PASSWORD=your_strong_admin_password

# Security Settings
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100  # 100 requests per window
CORS_ORIGIN=https://your-frontend-domain.com
```

## Setting Environment Variables in Terminal

For one-time use (variables will be cleared when terminal session ends):

```bash
export ADMIN_EMAIL="secure-admin@yourdomain.com"
export ADMIN_NAME="Secure Admin User"
export ADMIN_PASSWORD="$(openssl rand -base64 12)"

# Run the admin seeder with these variables
npm run seed:admin

# Clear variables after use
unset ADMIN_EMAIL ADMIN_NAME ADMIN_PASSWORD
```

## Using the setup-admin.sh Script

The provided `setup-admin.sh` script automates the process of:
1. Setting secure environment variables
2. Generating a random secure password
3. Running the admin seeder script
4. Clearing environment variables after use

To use it:

```bash
cd server
chmod +x setup-admin.sh
./setup-admin.sh
```

Make sure to save the displayed credentials securely as they will only be shown once. 