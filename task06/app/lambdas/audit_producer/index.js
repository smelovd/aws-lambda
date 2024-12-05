const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log(JSON.stringify(event, null, 2))
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

};
