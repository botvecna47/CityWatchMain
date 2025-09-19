# Email Setup Guide for CityWatch

This guide will help you configure email services for the CityWatch application.

## Option 1: Gmail (Recommended for Development)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password
1. In Google Account settings, go to Security → App passwords
2. Select "Mail" as the app
3. Select "Other" as the device and enter "CityWatch"
4. Copy the generated 16-character password

### Step 3: Configure Environment Variables
Create a `.env` file in the backend directory with:

```env
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-character-app-password"
```

## Option 2: SendGrid (Recommended for Production)

### Step 1: Create SendGrid Account
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your account

### Step 2: Create API Key
1. Go to Settings → API Keys
2. Create a new API key with "Mail Send" permissions
3. Copy the API key

### Step 3: Configure Environment Variables
```env
SENDGRID_API_KEY="your-sendgrid-api-key"
```

## Option 3: Mailgun (Alternative)

### Step 1: Create Mailgun Account
1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Verify your domain

### Step 2: Get Credentials
1. Go to your domain settings
2. Copy the API key and domain

### Step 3: Configure Environment Variables
```env
MAILGUN_API_KEY="your-mailgun-api-key"
MAILGUN_DOMAIN="your-mailgun-domain"
```

## Development Mode

If no email service is configured, the application will run in development mode:
- OTP codes will be logged to the console
- Users can still verify their accounts using the displayed code
- No actual emails will be sent

## Testing Email Configuration

1. Start the server: `npm run dev`
2. Try to sign up with a new account
3. Check the console logs for email service status
4. If configured properly, you should see "✅ OTP email sent successfully"

## Troubleshooting

### Gmail Issues
- Make sure you're using an App Password, not your regular password
- Ensure 2-Factor Authentication is enabled
- Check that "Less secure app access" is disabled (use App Passwords instead)

### SendGrid Issues
- Verify your API key has the correct permissions
- Check your SendGrid account status
- Ensure you're not hitting rate limits

### Mailgun Issues
- Verify your domain is properly configured
- Check your API key permissions
- Ensure your domain is verified

## Production Considerations

- Use a dedicated email service (SendGrid, Mailgun) for production
- Set up proper error monitoring for email failures
- Consider implementing email templates
- Monitor email delivery rates and bounce rates
