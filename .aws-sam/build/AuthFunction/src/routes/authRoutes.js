const { hashPassword, comparePasswords } = require('../utils/password');
const { generateToken } = require('../utils/token');
const { processImage } = require('../utils/imageHandler');
const { dynamoDb } = require('../config/dynamodb');

const authRoutes = {
  signup: async (event) => {
    const { email, password, name, profileImage } = JSON.parse(event.body);
    
    // Check if user exists
    const existingUser = await dynamoDb.get({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { email }
    }).promise();

    if (existingUser.Item) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'User already exists' })
      };
    }

    // Process profile image if provided
    let imageUrl = null;
    if (profileImage) {
      imageUrl = await processImage(profileImage, email);
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = {
      email,
      password: hashedPassword,
      name,
      profileImage: imageUrl,
      createdAt: new Date().toISOString()
    };

    await dynamoDb.put({
      TableName: process.env.DYNAMODB_TABLE,
      Item: user
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'User created successfully',
        user: {
          email: user.email,
          name: user.name,
          profileImage: user.profileImage
        }
      })
    };
  },

  login: async (event) => {
    const { email, password } = JSON.parse(event.body);

    const result = await dynamoDb.get({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { email }
    }).promise();

    if (!result.Item || !(await comparePasswords(password, result.Item.password))) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    const token = generateToken(result.Item);

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        user: {
          email: result.Item.email,
          name: result.Item.name,
          profileImage: result.Item.profileImage
        }
      })
    };
  },

  updateProfileImage: async (event) => {
    const { email } = event.user;
    const { profileImage } = JSON.parse(event.body);

    const imageUrl = await processImage(profileImage, email);

    await dynamoDb.update({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { email },
      UpdateExpression: 'set profileImage = :imageUrl',
      ExpressionAttributeValues: {
        ':imageUrl': imageUrl
      }
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Profile image updated successfully',
        profileImage: imageUrl
      })
    };
  }
};

module.exports = authRoutes;