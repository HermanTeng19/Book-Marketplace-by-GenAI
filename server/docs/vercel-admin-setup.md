# Setting Up Admin Users on Vercel

This guide explains how to set up admin users after deploying your Book Marketplace application to Vercel.

## Environment Variables Setup

1. **Log in to your Vercel dashboard**
2. **Navigate to your project**
3. **Go to Settings > Environment Variables**
4. **Add the following environment variables**:

   | Variable | Description | Example |
   |----------|-------------|---------|
   | `ADMIN_EMAIL` | Email for the admin user | admin@yourdomain.com |
   | `ADMIN_NAME` | Name for the admin user | Admin User |
   | `ADMIN_PASSWORD` | Secure password for the admin user | (use a strong password) |
   | `SETUP_TOKEN` | A secure random token to authorize the setup | (generate with `openssl rand -hex 32`) |
   | `SETUP_ENABLED` | Enable or disable the setup endpoint | true |

   > **Note**: Set `SETUP_ENABLED` to `true` only during initial setup. Change it to `false` after setup is complete.

## Creating the Admin User

After deploying with the environment variables set:

1. **Generate a setup token** (if you haven't already):
   ```bash
   openssl rand -hex 32
   ```

2. **Make a POST request to the setup endpoint**:
   ```
   POST https://your-vercel-app.vercel.app/api/setup/admin-setup/{SETUP_TOKEN}
   ```

   You can use tools like Postman, cURL, or a simple fetch request:

   ```bash
   curl -X POST https://your-vercel-app.vercel.app/api/setup/admin-setup/{SETUP_TOKEN}
   ```

   Replace `{SETUP_TOKEN}` with the token you generated and set in Vercel.

3. **Verify the response**:
   ```json
   {
     "success": true,
     "message": "Admin user created successfully",
     "user": {
       "id": "user_id",
       "name": "Admin User",
       "email": "admin@yourdomain.com",
       "role": "admin"
     }
   }
   ```

## Security Considerations

1. **Disable the setup endpoint after use**:
   - Go back to Vercel dashboard
   - Change `SETUP_ENABLED` to `false`
   - Redeploy your application

2. **Remove sensitive environment variables**:
   - After setup, you can remove `ADMIN_PASSWORD` and `SETUP_TOKEN` from your environment variables

3. **Use HTTPS**:
   - Always access your Vercel deployment over HTTPS
   - Never send the setup token over an insecure connection

4. **Log in immediately**:
   - After creating the admin user, log in immediately to verify it works
   - Change the password through the application's UI if needed

## Troubleshooting

If you encounter issues:

1. **Check environment variables**:
   - Verify all required variables are set correctly
   - Ensure there are no typos in the variable names

2. **Check logs**:
   - Review Vercel function logs for any errors
   - Look for MongoDB connection issues

3. **Verify MongoDB connection**:
   - Ensure your MongoDB URI is correct
   - Check if your IP is whitelisted in MongoDB Atlas (if using Atlas)

4. **Try in development first**:
   - Test the setup process locally before deploying to Vercel 