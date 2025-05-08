#!/bin/bash

# Script to securely set up an admin user with environment variables
# Usage: ./setup-admin.sh

# Set secure environment variables for admin user
export ADMIN_EMAIL="herman@herman.net"
export ADMIN_NAME="Herman Teng"
export ADMIN_PASSWORD="$(openssl rand -base64 12)"  # Generate a secure random password

# Display the generated credentials (only shown once for initial setup)
echo "======================================================="
echo "ADMIN USER CREDENTIALS (SAVE THESE SECURELY)"
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