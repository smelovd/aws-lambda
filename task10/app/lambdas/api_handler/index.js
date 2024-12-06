const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamo = new AWS.DynamoDB.DocumentClient();

// Function to handle different events
exports.handler = async (event) => {
    const httpMethod = event.httpMethod;
    const path = event.path;

    console.log("Event:", event);
    let body = JSON.parse(event)
    console.log("Body:", body);

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
    console.log("Body:", body);
    const { username, password, email } = body;
    const params = {
        ClientId: "cmtr-e4ed9c72-simple-booking-userpool-test",
        Username: username,
        Password: password,
        UserAttributes: [
            { Name: 'email', Value: email },
        ],
    };
    console.log("Params:", params);

    const response = await cognito.signUp(params).promise();
    console.log("Response:", response);
    return {
        statusCode: 201,
        body: JSON.stringify({ message: 'User created successfully', userSub: response.UserSub }),
    };
}

// Sign in user with Cognito
async function signIn(body) {
    console.log("Body:", body);
    const { username, password } = body;
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: "cmtr-e4ed9c72-simple-booking-userpool-test",
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
        },
    };
    console.log("Params:", params);

    const response = await cognito.initiateAuth(params).promise();
    console.log("Response:", response);
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
    console.log("Data:", data);
    return {
        statusCode: 200,
        body: JSON.stringify({ tables: data.Items }),
    };
}

// Make reservation and store in DynamoDB
async function makeReservation(body) {
    console.log("Body:", body);
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
    console.log("Params:", params);

    await dynamo.put(params).promise();
    console.log("Reservation created successfully");
    return {
        statusCode: 201,
        body: JSON.stringify({ message: 'Reservation created successfully' }),
    };
}

// Fetch reservations from DynamoDB
async function getReservations() {
    console.log("Fetching reservations");
    const params = {
        TableName: "cmtr-e4ed9c72-Reservations-test",
    };

    const data = await dynamo.scan(params).promise();
    console.log("Data:", data);
    const reservations = data.Items.filter((item) => item.customerName);
    console.log("Reservations:", reservations);
    return {
        statusCode: 200,
        body: JSON.stringify({ reservations }),
    };
}
