require('dotenv').config();
const nodemailer = require('nodemailer');

// Create transporter with multiple service options
const createTransporter = () => {
  // Check for Gmail configuration first
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.log('📧 Using Gmail SMTP service');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      }
    });
  }

  // Check for SendGrid configuration
  if (process.env.SENDGRID_API_KEY) {
    console.log('📧 Using SendGrid service');
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      }
    });
  }

  // Check for Mailgun configuration
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    console.log('📧 Using Mailgun service');
    return nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILGUN_API_KEY,
        pass: process.env.MAILGUN_DOMAIN,
      }
    });
  }

  // Fallback to console logging (development mode)
  console.log('⚠️ No email service configured, using console fallback');
  return null;
};

// Create transporter lazily to ensure environment variables are loaded
let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

// Reset transporter when environment changes
const resetTransporter = () => {
  transporter = null;
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, firstName, otpCode) => {
  console.log(`📧 Attempting to send OTP email to: ${email}`);
  console.log(`📧 From address: ${process.env.GMAIL_USER || 'Not configured'}`);
  
  const transporter = getTransporter();
  const mailOptions = {
    from: process.env.GMAIL_USER || 'noreply@citywatch.com',
    to: email,
    subject: 'CityWatch - Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1A4D3A, #2D6A4F); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">CityWatch</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #1A4D3A; margin-top: 0;">Hello ${firstName || 'there'}!</h2>
          
          <p style="color: #495057; line-height: 1.6; font-size: 16px;">
            Thank you for signing up with CityWatch! To complete your registration and start using our platform, 
            please verify your email address using the verification code below:
          </p>
          
          <div style="background: white; border: 2px solid #1A4D3A; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">Your verification code:</p>
            <div style="font-size: 32px; font-weight: bold; color: #1A4D3A; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otpCode}
            </div>
          </div>
          
          <p style="color: #6c757d; font-size: 14px; margin: 20px 0;">
            <strong>Important:</strong> This code will expire in 10 minutes for security reasons.
          </p>
          
          <p style="color: #495057; line-height: 1.6;">
            If you didn't create an account with CityWatch, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 25px 0;">
          
          <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message from CityWatch. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    // If no email service is configured, log to console for development
    if (!transporter) {
      console.log(`📧 [DEVELOPMENT MODE] OTP email would be sent to ${email}`);
      console.log(`📧 [DEVELOPMENT MODE] Subject: ${mailOptions.subject}`);
      console.log(`📧 [DEVELOPMENT MODE] OTP Code: ${otpCode}`);
      console.log(
        `📧 [DEVELOPMENT MODE] To configure email service, set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file`
      );
      return { success: true, developmentMode: true };
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send resend OTP email
const sendResendOTPEmail = async (email, firstName, otpCode) => {
  console.log(`📧 Attempting to resend OTP email to: ${email}`);
  console.log(`📧 From address: ${process.env.GMAIL_USER || 'Not configured'}`);
  
  const transporter = getTransporter();
  const mailOptions = {
    from: process.env.GMAIL_USER || 'noreply@citywatch.com',
    to: email,
    subject: 'CityWatch - New Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1A4D3A, #2D6A4F); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">CityWatch</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">New Verification Code</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #1A4D3A; margin-top: 0;">Hello ${firstName || 'there'}!</h2>
          
          <p style="color: #495057; line-height: 1.6; font-size: 16px;">
            You requested a new verification code for your CityWatch account. 
            Here's your new verification code:
          </p>
          
          <div style="background: white; border: 2px solid #1A4D3A; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">Your new verification code:</p>
            <div style="font-size: 32px; font-weight: bold; color: #1A4D3A; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otpCode}
            </div>
          </div>
          
          <p style="color: #6c757d; font-size: 14px; margin: 20px 0;">
            <strong>Important:</strong> This code will expire in 10 minutes for security reasons.
          </p>
          
          <p style="color: #495057; line-height: 1.6;">
            If you didn't request a new verification code, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 25px 0;">
          
          <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message from CityWatch. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    // If no email service is configured, log to console for development
    if (!transporter) {
      console.log(
        `📧 [DEVELOPMENT MODE] Resend OTP email would be sent to ${email}`
      );
      console.log(`📧 [DEVELOPMENT MODE] Subject: ${mailOptions.subject}`);
      console.log(`📧 [DEVELOPMENT MODE] OTP Code: ${otpCode}`);
      console.log(
        `📧 [DEVELOPMENT MODE] To configure email service, set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file`
      );
      return { success: true, developmentMode: true };
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Resend OTP email sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(
      `❌ Failed to send resend OTP email to ${email}:`,
      error.message
    );
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendResendOTPEmail,
};
