#!/usr/bin/env node

/**
 * Test the duplicate check API endpoint directly
 */

const axios = require('axios');

async function testAPI() {
  console.log('🧪 Testing duplicate check API endpoint...\n');

  try {
    // First, let's try to get a token by logging in
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'email3@gmail.com', // Use a real user from the database
      password: 'password123'
    });

    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful, got token');

    // Now test the duplicate check endpoint
    const duplicateResponse = await axios.post('http://localhost:5000/api/reports/check-duplicate', {
      title: 'Water',
      description: 'WaterWater',
      latitude: 19.0760,
      longitude: 72.8777
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Duplicate check response:');
    console.log('Status:', duplicateResponse.status);
    console.log('Data:', JSON.stringify(duplicateResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
  }
}

testAPI();
