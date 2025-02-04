# Authentication Server with Image Upload

A serverless authentication backend built with AWS Lambda, API Gateway, DynamoDB, and S3. This service provides user authentication, authorization, and profile image management functionality.

## Features

- User signup and login with JWT authentication
- Profile image upload and management
- Custom API Gateway authorizer for protected routes
- Secure password hashing with bcrypt
- Image processing and storage in S3
- DynamoDB for user data storage

## Prerequisites

- Node.js 18.x or later
- AWS CLI configured with appropriate credentials
- AWS SAM CLI installed
- An AWS account with permissions to create:
  - Lambda functions
  - API Gateway
  - DynamoDB tables
  - S3 buckets
  - IAM roles

## Project Structure

```
.
├── src/
│   ├── index.js                 # Main Lambda handler
│   ├── middleware/
│   │   ├── auth.js             # Token verification middleware
│   │   └── authorizer.js       # API Gateway custom authorizer
│   ├── routes/
│   │   └── authRoutes.js       # Authentication route handlers
│   ├── utils/
│   │   ├── imageHandler.js     # Image processing utilities
│   │   ├── password.js         # Password hashing utilities
│   │   ├── token.js           # JWT utilities
│   │   └── validation.js      # Input validation utilities
│   └── config/
│       └── dynamodb.js        # AWS SDK configuration
├── template.yaml              # SAM template
├── package.json
└── README.md
```

## API Endpoints

- POST `/signup` - Create a new user account

  - Body: `{ "email": "user@example.com", "password": "password123", "name": "John Doe", "profileImage": "base64Image" }`

- POST `/login` - Authenticate user and receive JWT

  - Body: `{ "email": "user@example.com", "password": "password123" }`

- PUT `/profile-image` - Update user's profile image (Protected route)
  - Headers: `Authorization: Bearer <jwt_token>`
  - Body: `{ "profileImage": "base64Image" }`

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:

```bash
npm install
```

3. Create an S3 bucket for SAM deployments (if not exists):

```bash
aws s3 mb s3://your-deployment-bucket-name
```

4. Build and deploy:

```bash
sam build
sam deploy --guided
```

During the guided deployment, you'll need to provide:

- Stack name
- AWS Region
- JWT secret
- DynamoDB table name
- S3 bucket name for profile images
- Environment (dev/prod)

## Updating Deployed Code

To update only the Lambda function code without changing infrastructure:

```bash
sam build
sam deploy \
  --no-fail-on-empty-changeset \
  --no-confirm-changeset \
  --parameter-overrides \
    JWTSecret=<your-existing-secret> \
    DynamoDBTableName=<your-existing-table> \
    S3BucketName=<your-existing-bucket> \
  --capabilities CAPABILITY_IAM
```

## Environment Variables

The following environment variables are required:

- `JWT_SECRET` - Secret key for JWT signing
- `DYNAMODB_TABLE` - DynamoDB table name for user data
- `S3_BUCKET_NAME` - S3 bucket name for profile images
- `NODE_ENV` - Environment (dev/prod)

## Security Features

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens expire after 24 hours
- Protected routes require valid JWT token
- Profile images are processed and stored securely in S3
- CORS configuration for secure client-side access
- Input validation for all routes
- Error handling and logging

## Development

For local development:

1. Install dependencies:

```bash
npm install
```

2. Start local API:

```bash
npm run start-local
```

3. Run tests:

```bash
npm test
```

4. Lint code:

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)
