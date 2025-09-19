const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testImageUpload() {
  try {
    // Find a citizen user to create a report
    const citizen = await prisma.user.findFirst({
      where: { role: 'citizen' }
    });

    if (!citizen) {
      console.log('No citizen user found. Creating one...');
      
      // Create a test citizen user
      const newCitizen = await prisma.user.create({
        data: {
          username: 'testcitizen',
          email: 'testcitizen@example.com',
          password: 'hashedpassword', // In real app, this would be hashed
          firstName: 'Test',
          lastName: 'Citizen',
          role: 'citizen',
          isVerified: true,
          cityId: '1' // Assuming city with ID 1 exists
        }
      });
      
      console.log('Created test citizen:', newCitizen.email);
    }

    // Find a city
    const city = await prisma.city.findFirst();
    if (!city) {
      console.log('No city found. Creating one...');
      const newCity = await prisma.city.create({
        data: {
          name: 'Test City',
          slug: 'test-city'
        }
      });
      console.log('Created test city:', newCity.name);
    }

    // Create a test report
    const report = await prisma.report.create({
      data: {
        title: 'Test Report with Image',
        description: 'This is a test report to verify image upload functionality. The image should be displayed correctly in the frontend.',
        category: 'OTHER',
        status: 'OPEN',
        latitude: 28.6139,
        longitude: 77.2090,
        authorId: citizen?.id || (await prisma.user.findFirst({ where: { role: 'citizen' } })).id,
        cityId: (await prisma.city.findFirst()).id
      }
    });

    console.log('Created test report:', report.id);

    // Create a test attachment
    const testImagePath = path.join(__dirname, 'test-image.txt');
    const attachment = await prisma.attachment.create({
      data: {
        filename: 'test-image.txt',
        filepath: 'test-image.txt',
        mimetype: 'text/plain',
        size: fs.statSync(testImagePath).size,
        reportId: report.id
      }
    });

    console.log('Created test attachment:', attachment.id);
    console.log('Attachment URL would be:', `http://localhost:5000/assets/reports/${attachment.filepath}`);

    // Copy test file to reports directory
    const reportsDir = path.join(__dirname, 'assets', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const destPath = path.join(reportsDir, 'test-image.txt');
    fs.copyFileSync(testImagePath, destPath);
    console.log('Copied test file to:', destPath);

    console.log('\n✅ Test setup complete!');
    console.log('Report ID:', report.id);
    console.log('You can now view this report in the frontend to test image display.');

  } catch (error) {
    console.error('Error setting up test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImageUpload();
