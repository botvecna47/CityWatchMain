const nodemailer = require('nodemailer');

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Use App Password for Gmail
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, firstName, otpCode) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
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
  const mailOptions = {
    from: process.env.GMAIL_USER,
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
    await transporter.sendMail(mailOptions);
    console.log(`✅ Resend OTP email sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send resend OTP email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendResendOTPEmail,
};
