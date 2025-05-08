#!/bin/bash

# Script to securely set up an additional admin user with environment variables
# Usage: ./add-new-admin.sh

# Set secure environment variables for admin user
export ADMIN_EMAIL="newadmin@example.com"  # Change this to the new admin's email
export ADMIN_NAME="New Admin User"         # Change this to the new admin's name
export ADMIN_PASSWORD="$(openssl rand -base64 12)"  # Generate a secure random password

# Display the generated credentials (only shown once for initial setup)
echo "======================================================="
echo "NEW ADMIN USER CREDENTIALS (SAVE THESE SECURELY)"
echo "======================================================="
echo "Email: $ADMIN_EMAIL"
echo "Name: $ADMIN_NAME"
echo "Password: $ADMIN_PASSWORD"
echo "======================================================="
echo "These credentials will NOT be shown again!"
echo "======================================================="

# Run the admin seeder script with the secure environment variables
echo "Creating admin user..."
node utils/adminSeeder.js

# Clear environment variables after use for security
unset ADMIN_EMAIL
unset ADMIN_NAME
unset ADMIN_PASSWORD

echo "Admin setup complete. Environment variables have been cleared." 