const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamo = new AWS.DynamoDB.DocumentClient();

// Utility function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Utility function to validate password (example rule: 8+ chars, 1 uppercase, 1 number)
function isValidPassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
}

// Hardcoded configuration values (Replace with your actual values)
const COGNITO_CLIENT_ID = process.env.cup_client_id; // "cmtr-e4ed9c72-simple-booking-userpool-test";
const DYNAMODB_TABLE_NAME_RESERVATIONS = "cmtr-e4ed9c72-Reservations-test";
const DYNAMODB_TABLE_NAME_TABLES = "cmtr-e4ed9c72-Tables-test";

// Function to handle different events
exports.handler = async (event) => {
    console.log(event)
    console.log("Cup client id: " + process.env.cup_client_id);
    return await signUp(event);

    // try {
    //     if (httpMethod === 'POST' && path === '/signup') {
    //     } else if (httpMethod === 'POST' && path === '/signin') {
    //         return await signIn(body);
    //     } else if (httpMethod === 'GET' && path === '/tables') {
    //         return await getTables();
    //     } else if (httpMethod === 'POST' && path === '/reservations') {
    //         return await makeReservation(body);
    //     } else if (httpMethod === 'GET' && path === '/reservations') {
    //         return await getReservations();
    //     } else {
    //         return { statusCode: 404, body: JSON.stringify({ error: 'Not Found' }) };
    //     }
    // } catch (error) {
    //     console.error('Error:', error);
    //     return {
    //         statusCode: error.statusCode || 500,
    //         body: JSON.stringify({ error: error.message }),
    //     };
    // }
};

// Sign up user with Cognito
async function signUp(body) {
    try {
        const { firstName, lastName, password, email } = body;

        const validationResult = validateSignupInput(body);
        if (!validationResult.valid) {
            throw new Error(validationResult.error);
        }

        const params = {
            ClientId: COGNITO_CLIENT_ID,
            Username: email,
            Password: password,
            UserAttributes: [
                { Name: 'given_name', Value: firstName },
                { Name: 'family_name', Value: lastName },
                { Name: 'email', Value: email },
            ],
        };

        console.log('Params:', params)

        const response = await cognito.signUp(params).promise();
        console.log('Response:', response)
        return {
            statusCode: 200,
            body: JSON.stringify({ accessToken: response.UserSub }),
            headers: { 'Access-Control-Allow-Origin': '*' }
        };
    } catch (error) {
        console.error('Error:', error.message);
        return { statusCode: 400, body: JSON.stringify({ error: error.message }), headers: { 'Access-Control-Allow-Origin': '*' } };
    }
}

function validateSignupInput(body) {
    const { firstName, lastName, email, password } = body;

    // Проверка firstName и lastName (строка, не пустая)
    if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
        return { valid: false, error: 'Имя (firstName) должно быть строкой и не должно быть пустым' };
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
        return { valid: false, error: 'Фамилия (lastName) должна быть строкой и не должна быть пустой' };
    }

    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return { valid: false, error: 'Некорректный формат email' };
    }

    // Проверка пароля
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[$%^*-_]).{12,}$/;
    if (!password || !passwordRegex.test(password)) {
        return { valid: false, error: 'Пароль должен быть не менее 12 символов, содержать буквы, цифры и хотя бы один из символов "$%^*-_"' };
    }

    return { valid: true };
}

// Sign in user with Cognito
async function signIn(body) {
    const { email, password } = body;

    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: COGNITO_CLIENT_ID,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
        },
    };

    try {
        const response = await cognito.initiateAuth(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ token: response.UserSub }),
        };
    } catch (error) {
        if (error.code === 'NotAuthorizedException' || error.code === 'UserNotFoundException') {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email or password' }) };
        }
        throw error;
    }
}

// Fetch tables from DynamoDB
async function getTables() {
    const params = {
        TableName: DYNAMODB_TABLE_NAME_TABLES,
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
        TableName: DYNAMODB_TABLE_NAME_RESERVATIONS,
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
        TableName: DYNAMODB_TABLE_NAME_RESERVATIONS,
    };

    const data = await dynamo.scan(params).promise();
    const reservations = data.Items.filter((item) => item.customerName);
    return {
        statusCode: 200,
        body: JSON.stringify({ reservations }),
    };
}
