const { hashPassword, comparePasswords } = require('../utils/password');
const { generateToken } = require('../utils/token');
const { processImage } = require('../utils/imageHandler');
const { dynamoDb, s3 } = require('../config/dynamodb');

const authRoutes = {
    signup: async (event) => {
        try {
            const { email, password, name, profileImage } = JSON.parse(event.body);
            const timestamp = new Date().toISOString();

            const queryParams = {
                TableName: process.env.DYNAMODB_TABLE,
                KeyConditionExpression: 'email = :email',
                ExpressionAttributeValues: {
                    ':email': email
                }
            };

            const existingUser = await dynamoDb.query(queryParams).promise();

            if (existingUser.Items && existingUser.Items.length > 0) {
                return {
                    statusCode: 409,
                    body: JSON.stringify({ message: 'User already exists' })
                };
            }


            let imageUrl = null;
            if (profileImage) {
                imageUrl = await processImage(profileImage, email);
            }


            const hashedPassword = await hashPassword(password);
            const user = {
                email,
                timestamp,
                password: hashedPassword,
                name,
                profileImage: imageUrl,
                createdAt: timestamp
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
        } catch (error) {
            console.error('Error in signup:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error creating user', error: error.message })
            };
        }
    },

    login: async (event) => {
        try {
            const { email, password } = JSON.parse(event.body);


            const params = {
                TableName: process.env.DYNAMODB_TABLE,
                KeyConditionExpression: 'email = :email',
                ExpressionAttributeValues: {
                    ':email': email
                }
            };

            const result = await dynamoDb.query(params).promise();


            const user = result.Items && result.Items.sort((a, b) =>
                b.timestamp.localeCompare(a.timestamp)
            )[0];


            if (!user) {
                return {
                    statusCode: 401,
                    body: JSON.stringify({ message: 'Invalid credentials' })
                };
            }

            const passwordMatch = await comparePasswords(password, user.password);

            if (!passwordMatch) {
                return {
                    statusCode: 401,
                    body: JSON.stringify({ message: 'Invalid credentials' })
                };
            }

            const token = generateToken(user);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    token,
                    user: {
                        email: user.email,
                        name: user.name,
                        profileImage: user.profileImage
                    }
                })
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error during login', error: error.message })
            };
        }
    },

    updateProfileImage: async (event) => {
        try {
            const { email } = event.user;
            const { profileImage } = JSON.parse(event.body);
            const timestamp = event.user.timestamp;
            const imageUrl = await processImage(profileImage, email);
            await dynamoDb.update({
                TableName: process.env.DYNAMODB_TABLE,
                Key: {
                    "email": email,
                    timestamp: timestamp  // Use original timestamp
                },
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
        } catch (error) {
            console.error('Error updating profile image:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Error updating profile image: ' + error.message
                })
            };
        }
    },
    // Generate signed URL for S3 upload
    getUploadUrl: async (event) => {
        try {
            const { email } = event.user;
            const fileType = event.queryStringParameters?.fileType || 'image/jpeg';

            const key = `${email}/${Date.now()}.${fileType.split('/')[1]}`;

            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: key,
                ContentType: fileType,
                Expires: 300, // URL expires in 5 minutes
                ACL: 'public-read'
            };

            const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    uploadUrl,
                    key
                })
            };
        } catch (error) {
            console.error('Error generating upload URL:', error);
            throw error;
        }
    },
    // Save the S3 URL to user's profile
    saveProfileUrl: async (event) => {
        try {
            const { email } = event.user;
            const { key } = JSON.parse(event.body);

            const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
            const params = {
                TableName: process.env.DYNAMODB_TABLE,
                Key: {
                    email: email,
                    timestamp: event.user.timestamp // Assuming you store timestamp in user object
                },
                UpdateExpression: 'set profileImage = :imageUrl',
                ExpressionAttributeValues: {
                    ':imageUrl': imageUrl
                },
                ReturnValues: 'ALL_NEW'
            };

            await dynamodb.update(params).promise();

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Profile image updated successfully',
                    imageUrl
                })
            };
        } catch (error) {
            console.error('Error saving profile URL:', error);
            throw error;
        }
    },
};

module.exports = authRoutes;