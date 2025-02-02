const AWS = require('aws-sdk');


AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1'
});


const dynamoDb = new AWS.DynamoDB.DocumentClient();


const s3 = new AWS.S3();

module.exports = {
  dynamoDb,
  s3
};