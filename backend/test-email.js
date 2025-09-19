#!/usr/bin/env node

/**
 * Email Configuration Test Script
 * 
 * This script tests the email configuration for CityWatch
 * Run with: node test-email.js
 */

require('dotenv').config();
const { sendOTPEmail, generateOTP } = require('./utils/mailer');

async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration for CityWatch\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   GMAIL_USER: ${process.env.GMAIL_USER ? '✅ Set' : '❌ Not set'}`);
  console.log(`   GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Not set'}`);
  console.log(`   SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`   MAILGUN_API_KEY: ${process.env.MAILGUN_API_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`   MAILGUN_DOMAIN: ${process.env.MAILGUN_DOMAIN ? '✅ Set' : '❌ Not set'}\n`);
  
  // Determine which service to use
  let service = 'None';
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    service = 'Gmail';
  } else if (process.env.SENDGRID_API_KEY) {
    service = 'SendGrid';
  } else if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    service = 'Mailgun';
  }
  
  console.log(`📧 Email Service: ${service}\n`);
  
  if (service === 'None') {
    console.log('⚠️  No email service configured. Running in development mode.');
    console.log('   To configure email service, see EMAIL_SETUP.md\n');
  }
  
  // Test email sending
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testName = 'Test User';
  const testOTP = generateOTP();
  
  console.log(`📤 Testing email to: ${testEmail}`);
  console.log(`🔢 Test OTP: ${testOTP}\n`);
  
  try {
    const result = await sendOTPEmail(testEmail, testName, testOTP);
    
    if (result.success) {
      if (result.developmentMode) {
        console.log('✅ Development mode: Email would be sent successfully');
        console.log('   Check console logs above for email details');
      } else {
        console.log('✅ Email sent successfully!');
        console.log('   Check your inbox for the verification email');
      }
    } else {
      console.log('❌ Email sending failed:');
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.log('❌ Email test failed:');
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('\n📚 For setup instructions, see EMAIL_SETUP.md');
}

// Run the test
testEmailConfiguration().catch(console.error);
