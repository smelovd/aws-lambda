const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log(JSON.stringify(event, null, 2))
    if (event.Records[0].eventName == "INSERT") {
        item = {
            id: uuidv4(),
            itemKey: event.Records[0].dynamodb.Keys.key.S,
            modificationTime: new Date().toISOString(),
            newValue: {
                key: event.Records[0].dynamodb.NewImage.key.S,
                value: Number(event.Records[0].dynamodb.NewImage.value.N)
            }
        }
        console.log(JSON.stringify(item, null, 2))

        await dynamodb.put({
            TableName: "cmtr-e4ed9c72-Audit-test",
            Item: item
        }).promise();
    } else if (event.Records[0].eventName == "MODIFY") {
        item = {
            id: uuidv4(),
            itemKey: event.Records[0].dynamodb.Keys.key.S,
            modificationTime: new Date().toISOString(),
            updatedAttribute: event.Records[0].dynamodb.Keys.key.S,
            oldValue: Number(event.Records[0].dynamodb.OldImage.value.N),
            newValue: Number(event.Records[0].dynamodb.NewImage.value.N)
        }
        console.log(JSON.stringify(item, null, 2))

        await dynamodb.put({
            TableName: "cmtr-e4ed9c72-Audit-test",
            Item: item
        }).promise();
    }
};
