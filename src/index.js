// src/index.js - Main Lambda Handler
const authRoutes = require('./routes/authRoutes');
const { verifyToken } = require('./middleware/auth');

exports.handler = async (event, context) => {
  try {
    console.log('Event:', JSON.stringify(event));

    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'application/json'
    };

    // Route handling based on path and method
    let { path, method } = event.requestContext.http;

    //remove /dev/from path
    path = path.replace('/dev', '');

    console.log('Path:', path);
    console.log('Method:', method);

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Access-Control-Allow-Methods': 'POST, GET, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: ''
      };
    }

    let response;

    // Check if route requires authentication
    const protectedRoutes = ['/profile', '/profile-image'];
    if (protectedRoutes.includes(path)) {
      const user = await verifyToken(event);
      event.user = user; // Attach user to event object
    }

    // Route handling
    switch (true) {
      case path === '/signup' && method === 'POST':
        response = await authRoutes.signup(event);
        break;

      case path === '/login' && method === 'POST':
        response = await authRoutes.login(event);
        break;

      case path === '/profile-image' && method === 'PUT':
        response = await authRoutes.updateProfileImage(event);
        break;

      default:
        response = {
          statusCode: 404,
          body: JSON.stringify({ message: 'Route not found' })
        };
    }

    return {
      ...response,
      headers: { ...headers, ...response.headers }
    };

  } catch (error) {
    console.error('Error:', error);

    if (error.message === 'Unauthorized') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

