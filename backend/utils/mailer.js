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

// Send authority credentials email
const sendAuthorityCredentials = async (email, firstName, lastName, username, password, authorityType, city) => {
  console.log(`📧 Attempting to send authority credentials to: ${email}`);
  console.log(`📧 From address: ${process.env.GMAIL_USER || 'Not configured'}`);
  
  const transporter = getTransporter();
  const mailOptions = {
    from: process.env.GMAIL_USER || 'noreply@citywatch.com',
    to: email,
    subject: 'CityWatch - Authority Account Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1A4D3A, #2D6A4F); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">CityWatch</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Authority Account Created</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #1A4D3A; margin-top: 0;">Welcome ${firstName} ${lastName}!</h2>
          
          <p style="color: #495057; line-height: 1.6; font-size: 16px;">
            Your authority account has been successfully created by the CityWatch administrator. 
            You can now access the platform using the credentials below:
          </p>
          
          <div style="background: white; border: 2px solid #1A4D3A; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #1A4D3A; margin-top: 0; margin-bottom: 20px;">Your Login Credentials</h3>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">Username:</strong>
              <div style="background: #f8f9fa; padding: 8px 12px; border-radius: 4px; font-family: 'Courier New', monospace; margin-top: 5px;">
                ${username}
              </div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">Password:</strong>
              <div style="background: #f8f9fa; padding: 8px 12px; border-radius: 4px; font-family: 'Courier New', monospace; margin-top: 5px;">
                ${password}
              </div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">Authority Type:</strong>
              <div style="background: #e3f2fd; padding: 8px 12px; border-radius: 4px; margin-top: 5px; color: #1976d2;">
                ${authorityType}
              </div>
            </div>
            
            <div style="margin-bottom: 0;">
              <strong style="color: #495057;">Assigned City:</strong>
              <div style="background: #e8f5e8; padding: 8px 12px; border-radius: 4px; margin-top: 5px; color: #2e7d32;">
                ${city}
              </div>
            </div>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="color: #856404; margin-top: 0;">🔐 Security Instructions</h4>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>Please change your password immediately after your first login</li>
              <li>Keep your credentials secure and do not share them with others</li>
              <li>Use a strong, unique password for your account</li>
              <li>Log out from shared or public computers</li>
            </ul>
          </div>
          
          <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="color: #0c5460; margin-top: 0;">📱 Next Steps</h4>
            <ol style="color: #0c5460; margin: 0; padding-left: 20px;">
              <li>Visit the CityWatch platform</li>
              <li>Log in using the credentials provided above</li>
              <li>Complete your profile setup</li>
              <li>Start managing reports and updates for your assigned city</li>
            </ol>
          </div>
          
          <p style="color: #495057; line-height: 1.6;">
            If you have any questions or need assistance, please contact your system administrator.
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
      console.log(`📧 [DEVELOPMENT MODE] Authority credentials email would be sent to ${email}`);
      console.log(`📧 [DEVELOPMENT MODE] Subject: ${mailOptions.subject}`);
      console.log(`📧 [DEVELOPMENT MODE] Username: ${username}`);
      console.log(`📧 [DEVELOPMENT MODE] Password: ${password}`);
      console.log(`📧 [DEVELOPMENT MODE] Authority Type: ${authorityType}`);
      console.log(`📧 [DEVELOPMENT MODE] City: ${city}`);
      console.log(
        `📧 [DEVELOPMENT MODE] To configure email service, set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file`
      );
      return { success: true, developmentMode: true };
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Authority credentials email sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send authority credentials email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send alert notification email
const sendAlertNotification = async (email, firstName, alertTitle, alertMessage, city) => {
  console.log(`📧 Attempting to send alert notification to: ${email}`);
  
  const transporter = getTransporter();
  const mailOptions = {
    from: process.env.GMAIL_USER || 'noreply@citywatch.com',
    to: email,
    subject: `CityWatch Alert: ${alertTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🚨 CityWatch Alert</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Important City Notice</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #dc2626; margin-top: 0;">Hello ${firstName || 'there'}!</h2>
          
          <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">${alertTitle}</h3>
            <p style="color: #7f1d1d; line-height: 1.6; margin: 0;">${alertMessage}</p>
          </div>
          
          <div style="background: #e0f2fe; border: 1px solid #b3e5fc; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #0277bd; margin: 0; font-weight: 500;">
              📍 <strong>Location:</strong> ${city}
            </p>
          </div>
          
          <p style="color: #495057; line-height: 1.6;">
            Please stay informed and follow any safety instructions provided by local authorities.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 25px 0;">
          
          <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 0;">
            This is an automated alert from CityWatch. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    if (!transporter) {
      console.log(`📧 [DEVELOPMENT MODE] Alert notification would be sent to ${email}`);
      console.log(`📧 [DEVELOPMENT MODE] Subject: ${mailOptions.subject}`);
      console.log(`📧 [DEVELOPMENT MODE] Alert: ${alertTitle}`);
      return { success: true, developmentMode: true };
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Alert notification sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send alert notification to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send event notification email
const sendEventNotification = async (email, firstName, eventTitle, eventDescription, eventDateTime, eventLocation, city) => {
  console.log(`📧 Attempting to send event notification to: ${email}`);
  
  const transporter = getTransporter();
  const formattedDate = new Date(eventDateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const mailOptions = {
    from: process.env.GMAIL_USER || 'noreply@citywatch.com',
    to: email,
    subject: `CityWatch Event: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">📅 CityWatch Event</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Community Event Notice</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #059669; margin-top: 0;">Hello ${firstName || 'there'}!</h2>
          
          <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">${eventTitle}</h3>
            <p style="color: #166534; line-height: 1.6; margin: 0 0 15px 0;">${eventDescription}</p>
          </div>
          
          <div style="background: #e0f2fe; border: 1px solid #b3e5fc; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #0277bd; margin: 0 0 10px 0; font-weight: 500;">
              📅 <strong>Date & Time:</strong> ${formattedDate}
            </p>
            ${eventLocation ? `<p style="color: #0277bd; margin: 0 0 10px 0; font-weight: 500;">
              📍 <strong>Location:</strong> ${eventLocation}
            </p>` : ''}
            <p style="color: #0277bd; margin: 0; font-weight: 500;">
              🏙️ <strong>City:</strong> ${city}
            </p>
          </div>
          
          <p style="color: #495057; line-height: 1.6;">
            Join us for this community event! We look forward to seeing you there.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 25px 0;">
          
          <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 0;">
            This is an automated event notification from CityWatch. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    if (!transporter) {
      console.log(`📧 [DEVELOPMENT MODE] Event notification would be sent to ${email}`);
      console.log(`📧 [DEVELOPMENT MODE] Subject: ${mailOptions.subject}`);
      console.log(`📧 [DEVELOPMENT MODE] Event: ${eventTitle}`);
      return { success: true, developmentMode: true };
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Event notification sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send event notification to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send event approval notification email
const sendEventApprovalNotification = async (email, firstName, eventTitle, status, rejectionReason = null) => {
  console.log(`📧 Attempting to send event approval notification to: ${email}`);
  
  const transporter = getTransporter();
  const isApproved = status === 'APPROVED';
  const subject = isApproved ? `Event Approved: ${eventTitle}` : `Event Update: ${eventTitle}`;
  const headerColor = isApproved ? '#059669' : '#dc2626';
  const headerBg = isApproved ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #dc2626, #ef4444)';
  const icon = isApproved ? '✅' : '❌';
  const statusText = isApproved ? 'Approved' : 'Rejected';

  const mailOptions = {
    from: process.env.GMAIL_USER || 'noreply@citywatch.com',
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${headerBg}; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">${icon} Event ${statusText}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Event Status Update</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: ${headerColor}; margin-top: 0;">Hello ${firstName || 'there'}!</h2>
          
          <div style="background: ${isApproved ? '#f0fdf4' : '#fef2f2'}; border: 2px solid ${isApproved ? '#bbf7d0' : '#fecaca'}; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: ${headerColor}; margin-top: 0;">${eventTitle}</h3>
            <p style="color: ${isApproved ? '#166534' : '#7f1d1d'}; line-height: 1.6; margin: 0;">
              ${isApproved 
                ? 'Great news! Your event has been approved and is now live on the CityWatch platform. Citizens in your city will be notified about this event.'
                : 'Unfortunately, your event submission has been rejected. Please review the feedback below and consider resubmitting with the necessary changes.'
              }
            </p>
            ${!isApproved && rejectionReason ? `
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin-top: 15px;">
                <h4 style="color: #856404; margin-top: 0;">Rejection Reason:</h4>
                <p style="color: #856404; margin: 0;">${rejectionReason}</p>
              </div>
            ` : ''}
          </div>
          
          ${isApproved ? `
            <div style="background: #e0f2fe; border: 1px solid #b3e5fc; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h4 style="color: #0277bd; margin-top: 0;">Next Steps:</h4>
              <ul style="color: #0277bd; margin: 0; padding-left: 20px;">
                <li>Your event is now visible to citizens in your city</li>
                <li>You can manage event details from your dashboard</li>
                <li>Citizens will receive notifications about this event</li>
              </ul>
            </div>
          ` : `
            <div style="background: #e0f2fe; border: 1px solid #b3e5fc; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h4 style="color: #0277bd; margin-top: 0;">What to do next:</h4>
              <ul style="color: #0277bd; margin: 0; padding-left: 20px;">
                <li>Review the rejection reason above</li>
                <li>Make necessary changes to your event</li>
                <li>Resubmit your event for approval</li>
                <li>Contact support if you need assistance</li>
              </ul>
            </div>
          `}
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 25px 0;">
          
          <p style="color: #6c757d; font-size: 12px; text-align: center; margin: 0;">
            This is an automated notification from CityWatch. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    if (!transporter) {
      console.log(`📧 [DEVELOPMENT MODE] Event approval notification would be sent to ${email}`);
      console.log(`📧 [DEVELOPMENT MODE] Subject: ${mailOptions.subject}`);
      console.log(`📧 [DEVELOPMENT MODE] Status: ${status}`);
      return { success: true, developmentMode: true };
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Event approval notification sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send event approval notification to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendResendOTPEmail,
  sendAuthorityCredentials,
  sendAlertNotification,
  sendEventNotification,
  sendEventApprovalNotification,
};
