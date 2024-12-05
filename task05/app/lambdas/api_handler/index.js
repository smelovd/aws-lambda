const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        let body;

        if (event.body) {
            console.log('Received body:', JSON.stringify(event.body, null, 2));
            body = JSON.parse(event.body);
        } else {
            body = event
        }

        const { principalId, content } = body;
        console.log('principalId:', principalId);
        console.log('content:', content);

        if (!principalId || !content) {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    message: 'Invalid input. "principalId" must have a number and "content" must be a JSON object.'
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            };
        }

        const newItem = {
            TableName: "cmtr-e4ed9c72-Events-test",
            Item: {
                id: uuidv4(),
                principalId: Number(principalId),
                createdAt: new Date().toISOString(),
                body: content,
            }
        }

        console.log('newItem:', newItem);
        //log type of elements
        console.log("principalId type: " + typeof principalId + ", " + newItem.Item.principalId);

        await dynamodb.put(newItem).promise();

        console.log('Item created successfully');

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Event stored successfully',
                item: newItem.Item,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error storing event',
                error: err.message,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }
};
