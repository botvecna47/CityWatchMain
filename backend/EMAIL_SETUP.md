# Email Configuration Guide

## Gmail SMTP Setup

To enable email functionality for sending authority credentials, you need to configure Gmail SMTP in your `.env` file.

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password
1. In Google Account settings, go to Security
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and "Other (custom name)"
4. Enter "CityWatch" as the app name
5. Copy the generated 16-character password

### Step 3: Configure Environment Variables
Add these variables to your `.env` file:

```env
# Gmail SMTP Configuration
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-character-app-password"
```

### Step 4: Test Configuration
1. Start the server: `node server.js`
2. Create an authority account through the admin panel
3. Check the console logs for email status
4. The authority should receive an email with their login credentials

## Alternative Email Services

### SendGrid
```env
SENDGRID_API_KEY="your-sendgrid-api-key"
```

### Mailgun
```env
MAILGUN_API_KEY="your-mailgun-api-key"
MAILGUN_DOMAIN="your-mailgun-domain"
```

## Development Mode

If no email service is configured, the system will run in development mode and log the credentials to the console instead of sending emails.

## Email Template Features

The authority credentials email includes:
- Professional CityWatch branding
- Clear login credentials (username and password)
- Authority type and assigned city information
- Security instructions
- Next steps for the new authority user
- Responsive HTML design

## Troubleshooting

### Common Issues:
1. **"Authentication failed"**: Check your Gmail app password
2. **"Connection timeout"**: Verify your internet connection
3. **"Invalid credentials"**: Ensure 2FA is enabled and app password is correct

### Console Logs:
- ✅ Success: `Credentials email sent successfully to email@example.com`
- ⚠️ Warning: `Failed to send credentials email: [error message]`
- 📧 Development: `[DEVELOPMENT MODE] Authority credentials email would be sent to...`
