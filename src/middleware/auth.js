const { verifyToken: verify } = require('../utils/token');

const verifyToken = async (event) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization || event.headers.authorizationToken;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verify(token);
    
    return decoded;
  } catch (error) {
    throw new Error('Unauthorized');
  }
};

module.exports = {
  verifyToken
};