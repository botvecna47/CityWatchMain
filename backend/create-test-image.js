const fs = require('fs');
const path = require('path');

// Create a simple 1x1 pixel PNG image (base64 encoded)
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Convert base64 to buffer
const pngBuffer = Buffer.from(pngBase64, 'base64');

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, 'assets', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Write the PNG file
const imagePath = path.join(reportsDir, 'test-image.png');
fs.writeFileSync(imagePath, pngBuffer);

console.log('Created test PNG image at:', imagePath);
console.log('File size:', fs.statSync(imagePath).size, 'bytes');
