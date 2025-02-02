const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    
    try {
        if (!event.authorizationToken) {
            throw new Error('No token provided');
        }

        const token = event.authorizationToken.replace('Bearer ', '');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const policy = {
            principalId: decoded.email,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [{
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: event.methodArn
                }]
            },
            context: {
                email: decoded.email,
                name: decoded.name
            }
        };
        
        return policy;

    } catch (error) {
        
        
        const denyPolicy = {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [{
                    Action: 'execute-api:Invoke',
                    Effect: 'Deny',
                    Resource: event.methodArn
                }]
            }
        };
        
       
        return denyPolicy;
    }
};