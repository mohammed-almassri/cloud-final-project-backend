const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1'
});

// Initialize DynamoDB client
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Initialize S3 client
const s3 = new AWS.S3();

module.exports = {
  dynamoDb,
  s3
};