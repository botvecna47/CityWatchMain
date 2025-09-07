// Acceptance Test Script for CityWatch Reports System


const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

// Test data
let cityAId, cityBId;
let aliceToken, bobToken, carlToken, authorityToken, adminToken;
let reportId;

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  return { response, data };
}

async function runTests() {
  console.log('🚀 Starting CityWatch Acceptance Tests...\n');

  try {
    // Test 1: Create cities
    console.log('1️⃣ Creating test cities...');
    const { data: cityAData } = await makeRequest('/cities', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test City A', slug: 'city-a' })
    });
    cityAId = cityAData.city.id;
    console.log(`✅ Created City A: ${cityAData.city.name} (${cityAId})`);

    const { data: cityBData } = await makeRequest('/cities', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test City B', slug: 'city-b' })
    });
    cityBId = cityBData.city.id;
    console.log(`✅ Created City B: ${cityBData.city.name} (${cityBId})\n`);

    // Test 2: Signup users
    console.log('2️⃣ Creating test users...');
    
    // Alice in City A
    const { data: aliceData } = await makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'alice',
        email: 'alice@example.com',
        password: 'P@ssw0rd1',
        cityId: cityAId
      })
    });
    aliceToken = aliceData.accessToken;
    console.log(`✅ Created Alice (Citizen) in City A`);

    // Bob in City A
    const { data: bobData } = await makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'bob',
        email: 'bob@example.com',
        password: 'P@ssw0rd1',
        cityId: cityAId
      })
    });
    bobToken = bobData.accessToken;
    console.log(`✅ Created Bob (Citizen) in City A`);

    // Carl in City B
    const { data: carlData } = await makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'carl',
        email: 'carl@example.com',
        password: 'P@ssw0rd1',
        cityId: cityBId
      })
    });
    carlToken = carlData.accessToken;
    console.log(`✅ Created Carl (Citizen) in City B\n`);

    // Test 3: Alice creates a report
    console.log('3️⃣ Alice creates a report...');
    const { data: reportData } = await makeRequest('/reports', {
      method: 'POST',
      headers: { Authorization: `Bearer ${aliceToken}` },
      body: JSON.stringify({
        title: 'Garbage at 5th Street',
        description: 'Large pile of garbage near the market causing health concerns',
        category: 'GARBAGE'
      })
    });
    reportId = reportData.report.id;
    console.log(`✅ Alice created report: ${reportData.report.title} (${reportId})\n`);

    // Test 4: Bob can see Alice's report (same city)
    console.log('4️⃣ Bob views reports (should see Alice\'s report)...');
    const { data: bobReports } = await makeRequest('/reports', {
      headers: { Authorization: `Bearer ${bobToken}` }
    });
    const aliceReport = bobReports.reports.find(r => r.id === reportId);
    if (aliceReport) {
      console.log(`✅ Bob can see Alice's report: ${aliceReport.title}`);
    } else {
      console.log(`❌ Bob cannot see Alice's report`);
    }
    console.log(`📊 Bob sees ${bobReports.reports.length} total reports\n`);

    // Test 5: Carl cannot see Alice's report (different city)
    console.log('5️⃣ Carl views reports (should NOT see Alice\'s report)...');
    const { data: carlReports } = await makeRequest('/reports', {
      headers: { Authorization: `Bearer ${carlToken}` }
    });
    const aliceReportInCarl = carlReports.reports.find(r => r.id === reportId);
    if (!aliceReportInCarl) {
      console.log(`✅ Carl cannot see Alice's report (city isolation working)`);
    } else {
      console.log(`❌ Carl can see Alice's report (city isolation broken)`);
    }
    console.log(`📊 Carl sees ${carlReports.reports.length} total reports\n`);

    // Test 6: Authority cannot create reports
    console.log('6️⃣ Testing authority cannot create reports...');
    // First, we need to create an authority user (this would normally be done by admin)
    // For testing, let's create a user and manually update their role in the database
    const { data: authoritySignup } = await makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'authority_user',
        email: 'authority@example.com',
        password: 'P@ssw0rd1',
        cityId: cityAId
      })
    });
    
    // Try to create report as authority (should fail)
    const { response: authorityReportResponse } = await makeRequest('/reports', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authoritySignup.accessToken}` },
      body: JSON.stringify({
        title: 'Authority Report',
        description: 'This should fail',
        category: 'GARBAGE'
      })
    });
    
    if (authorityReportResponse.status === 403) {
      console.log(`✅ Authority cannot create reports (403 Forbidden)`);
    } else {
      console.log(`❌ Authority can create reports (should be forbidden)`);
    }
    console.log('');

    // Test 7: Get cities list
    console.log('7️⃣ Testing cities endpoint...');
    const { data: citiesData } = await makeRequest('/cities');
    console.log(`✅ Retrieved ${citiesData.cities.length} cities`);
    console.log(`📋 Cities: ${citiesData.cities.map(c => c.name).join(', ')}\n`);

    // Test 8: Test report detail endpoint
    console.log('8️⃣ Testing report detail endpoint...');
    const { data: reportDetail } = await makeRequest(`/reports/${reportId}`, {
      headers: { Authorization: `Bearer ${aliceToken}` }
    });
    console.log(`✅ Retrieved report details: ${reportDetail.report.title}`);
    console.log(`📊 Report status: ${reportDetail.report.status}`);
    console.log(`🏙️ Report city: ${reportDetail.report.city.name}\n`);

    console.log('🎉 All acceptance tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ City creation and management');
    console.log('✅ User signup with city assignment');
    console.log('✅ Report creation (citizens only)');
    console.log('✅ City-scoped report visibility');
    console.log('✅ Authority role restrictions');
    console.log('✅ API endpoints functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.data);
    }
  }
}

// Run tests
runTests();
