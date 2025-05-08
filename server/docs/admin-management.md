# Admin Management System

This document outlines the secure admin role management system implemented in the Book Marketplace application.

## Overview

The admin management system provides a secure way to:
- Create admin users
- Update user roles
- Track role changes with audit logs
- Enforce proper authorization

## Admin Seeder Script

The application includes a secure admin seeder script that can be used to create or update an admin user. This replaces the previous `update-role.js` and `update-admin.js` scripts with a more secure approach.

### Usage

```bash
# Run with default values
npm run seed:admin

# Run with custom values
ADMIN_EMAIL=admin@example.com ADMIN_NAME="Admin User" ADMIN_PASSWORD=securepassword npm run seed:admin
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| ADMIN_EMAIL | Email address for the admin user | admin@example.com |
| ADMIN_NAME | Name for the admin user | Admin User |
| ADMIN_PASSWORD | Password for the admin user | adminpassword |

## API Endpoints

The following API endpoints are available for admin role management:

### Update User Role

```
PUT /api/admin/users/:id/role
```

**Request Body:**
```json
{
  "role": "admin" // or "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated to admin",
  "data": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### Get User Role Audit Logs

```
GET /api/admin/users/:id/role-logs
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "action": "role_update",
      "previousRole": "user",
      "newRole": "admin",
      "updatedBy": "admin_user_id",
      "updatedAt": "2023-05-08T12:00:00.000Z",
      "notes": "Updated via API"
    }
  ]
}
```

## Security Features

1. **Audit Logging**: All role changes are logged with details about who made the change and when.
2. **Validation**: Role updates are validated to ensure only valid roles are assigned.
3. **Self-demotion Prevention**: Admins cannot remove their own admin privileges.
4. **Authorization Middleware**: All admin endpoints are protected by authentication and authorization middleware.
5. **Secure Seeding**: The admin seeder script supports environment variables for secure credential management.

## Best Practices

1. **Use Environment Variables**: Always use environment variables for sensitive information like admin credentials.
2. **Regular Audit**: Regularly review the audit logs for unauthorized role changes.
3. **Principle of Least Privilege**: Only assign admin roles to users who absolutely need them.
4. **Password Security**: Use strong passwords for admin accounts and change them regularly.
5. **API Security**: All admin API endpoints should be accessed over HTTPS only. 