const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function updateTestAttachment() {
  try {
    // Find the test attachment we created
    const attachment = await prisma.attachment.findFirst({
      where: { filename: 'test-image.txt' }
    });

    if (!attachment) {
      console.log('Test attachment not found');
      return;
    }

    // Update the attachment to use the PNG image
    const updatedAttachment = await prisma.attachment.update({
      where: { id: attachment.id },
      data: {
        filename: 'test-image.png',
        filepath: 'test-image.png',
        mimetype: 'image/png',
        size: fs.statSync(path.join(__dirname, 'assets', 'reports', 'test-image.png')).size
      }
    });

    console.log('Updated attachment:', updatedAttachment.id);
    console.log('New filename:', updatedAttachment.filename);
    console.log('New mimetype:', updatedAttachment.mimetype);
    console.log('New size:', updatedAttachment.size, 'bytes');
    console.log('Image URL:', `http://localhost:5000/assets/reports/${updatedAttachment.filepath}`);

    // Test the image URL
    console.log('\nTesting image URL...');
    const imagePath = path.join(__dirname, 'assets', 'reports', 'test-image.png');
    if (fs.existsSync(imagePath)) {
      console.log('✅ Image file exists at:', imagePath);
    } else {
      console.log('❌ Image file not found at:', imagePath);
    }

  } catch (error) {
    console.error('Error updating test attachment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTestAttachment();
