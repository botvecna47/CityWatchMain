const twilio = require('twilio');

// Initialize Twilio client (you'll need to add these to your .env file)
let client = null;

// Only initialize Twilio if credentials are provided
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio SMS service initialized');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Twilio SMS service:', error.message);
  }
} else {
  console.warn('⚠️ Twilio credentials not found. SMS service disabled.');
}

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS
const sendOTPSMS = async (phoneNumber, otp) => {
  try {
    // Check if Twilio client is available
    if (!client) {
      console.log(`📱 SMS service disabled. OTP for ${phoneNumber}: ${otp}`);
      return { success: true, messageId: 'demo-mode', demo: true };
    }

    // Format phone number for India (+91)
    const formattedNumber = phoneNumber.startsWith('+91') 
      ? phoneNumber 
      : `+91${phoneNumber}`;

    const message = await client.messages.create({
      body: `Your CityWatch verification code is: ${otp}. This code will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to: formattedNumber
    });

    console.log(`📱 SMS sent successfully to ${formattedNumber}, SID: ${message.sid}`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('❌ Failed to send SMS:', error);
    return { success: false, error: error.message };
  }
};

// Verify OTP (you can implement this with a database or cache)
const verifyOTP = (phoneNumber, otp, storedOTP) => {
  return otp === storedOTP;
};

module.exports = {
  generateOTP,
  sendOTPSMS,
  verifyOTP
};
