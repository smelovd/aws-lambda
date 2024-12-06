const axios = require('axios');
const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const WEATHER_TABLE = "Weather";

exports.handler = async (event) => {
    try {
        console.log("Event:", event);
        const latitude = "52.52";
        const longitude = "13.41";

        let weatherData;
        await AWSXRay.captureAsyncFunc('fetchWeatherData', async (subsegment) => {
            const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
                params: {
                    latitude,
                    longitude,
                    current: "temperature_2m,wind_speed_10m",
                    hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m",
                },
            });
            weatherData = response.data; // Assign the response data
            subsegment.close();
        });

        // Prepare the item for DynamoDB
        const item = {
            id: uuidv4(),
            forecast: weatherData,
        };

        // Store the data in DynamoDB
        await dynamodb
            .put({
                TableName: WEATHER_TABLE,
                Item: item,
            })
            .promise();

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