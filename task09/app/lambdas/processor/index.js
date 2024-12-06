const axios = require('axios');
const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const WEATHER_TABLE = "Weather";

exports.handler = async (event) => {
    try {
        console.log("Event:", event);

        let weatherData;
        await AWSXRay.captureAsyncFunc('fetchWeatherData', async (subsegment) => {
            const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);
            weatherData = response.data;
            subsegment.close();
        });
        console.log("Weather data:", weatherData);

        // Prepare the item for DynamoDB
        const item = {
            id: uuidv4(),
            forecast: weatherData,
        };

        console.log("Item:", item);

        // Store the data in DynamoDB
        await dynamodb
            .put({
                TableName: WEATHER_TABLE,
                Item: item,
            })
            .promise();
        
        console.log("Item saved successfully");

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Weather data saved successfully", item }),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};