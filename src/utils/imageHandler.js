const { s3 } = require('../config/dynamodb');

const processImage = async (base64Image, email) => {
  try {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const type = base64Image.split(';')[0].split('/')[1];
    const key = `profile-images/${email}-${Date.now()}.jpg`;

    await s3.putObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: type || 'image/jpeg',
      ACL: 'public-read'
    }).promise();

    return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.log('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};

module.exports = {
  processImage
};