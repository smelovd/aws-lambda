const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    // TODO implement
    console.log(JSON.stringify(event, null, 2));
    const body = {
        "ids": [
            uuidv4(),
            uuidv4(),
            uuidv4(),
            uuidv4(),
            uuidv4(),
            uuidv4(),
            uuidv4(),
            uuidv4(),
            uuidv4(),
            uuidv4()
        ]
    }

    const params = {
        Bucket: "cmtr-e4ed9c72-uuid-storage-test",
        Key: new Date().toISOString() + '.json',
        Body: Json.stringify(body),
    };

    await s3.putObject(params).promise();
};
