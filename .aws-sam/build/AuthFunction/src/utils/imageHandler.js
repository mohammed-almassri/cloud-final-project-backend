const { s3 } = require('../config/dynamodb');
const sharp = require('sharp');

const processImage = async (base64Image, email) => {
  try {
    // Remove data:image/xyz;base64, prefix
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Process image with Sharp
    const processedBuffer = await sharp(buffer)
      .resize(500, 500, { // Resize to standard dimensions
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 }) // Convert to JPEG and compress
      .toBuffer();
    
    // Generate unique filename
    const key = `profile-images/${email}-${Date.now()}.jpg`;
    
    // Upload to S3
    await s3.putObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: processedBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    }).promise();
    
    // Return the public URL
    return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};

module.exports = {
  processImage
};