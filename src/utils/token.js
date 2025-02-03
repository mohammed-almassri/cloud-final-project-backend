const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  try {
    return jwt.sign(
      {
        email: user.email,
        name: user.name,
        timestamp: user.timestamp
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate token');
  }
};

const verifyToken = async (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateToken,
  verifyToken
};