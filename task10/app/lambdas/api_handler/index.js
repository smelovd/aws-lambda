const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamo = new AWS.DynamoDB.DocumentClient();

// Function to handle different events
exports.handler = async (event) => {
    const httpMethod = event.httpMethod;
    const path = event.path;

    // Parse the body for POST/PUT requests
    let body = {};
    if (event.body) {
        body = JSON.parse(event.body);
    }

    try {
        if (httpMethod === 'POST' && path === '/signup') {
            return await signUp(body);
        } else if (httpMethod === 'POST' && path === '/signin') {
            return await signIn(body);
        } else if (httpMethod === 'GET' && path === '/tables') {
            return await getTables();
        } else if (httpMethod === 'POST' && path === '/reservations') {
            return await makeReservation(body);
        } else if (httpMethod === 'GET' && path === '/reservations') {
            return await getReservations();
        } else {
            return { statusCode: 404, body: JSON.stringify({ error: 'Not Found' }) };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

// Sign up user with Cognito
async function signUp(body) {
    const { username, password, email } = body;
    const params = {
        ClientId: "cmtr-e4ed9c72-simple-booking-userpool-test",
        Username: username,
        Password: password,
        UserAttributes: [
            { Name: 'email', Value: email },
        ],
    };

    const response = await cognito.signUp(params).promise();
    return {
        statusCode: 201,
        body: JSON.stringify({ message: 'User created successfully', userSub: response.UserSub }),
    };
}

// Sign in user with Cognito
async function signIn(body) {
    const { username, password } = body;
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: "cmtr-e4ed9c72-simple-booking-userpool-test",
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
        },
    };

    const response = await cognito.initiateAuth(params).promise();
    return {
        statusCode: 200,
        body: JSON.stringify({ token: response.AuthenticationResult.IdToken }),
    };
}

// Fetch tables from DynamoDB
async function getTables() {
    const params = {
        TableName: "cmtr-e4ed9c72-Tables-test",
    };

    const data = await dynamo.scan(params).promise();
    return {
        statusCode: 200,
        body: JSON.stringify({ tables: data.Items }),
    };
}

// Make reservation and store in DynamoDB
async function makeReservation(body) {
    const { tableId, customerName, reservationTime } = body;
    const params = {
        TableName: "cmtr-e4ed9c72-Reservations-test",
        Item: {
            tableId,
            reservationTime,
            customerName,
            reservationId: `res-${Date.now()}`,
        },
    };

    await dynamo.put(params).promise();
    return {
        statusCode: 201,
        body: JSON.stringify({ message: 'Reservation created successfully' }),
    };
}

// Fetch reservations from DynamoDB
async function getReservations() {
    const params = {
        TableName: "cmtr-e4ed9c72-Reservations-test",
    };

    const data = await dynamo.scan(params).promise();
    const reservations = data.Items.filter((item) => item.customerName);
    return {
        statusCode: 200,
        body: JSON.stringify({ reservations }),
    };
}
