const axios = require('axios');
const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

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

        const item = {
            id: uuidv4(),
            forecast: {
                elevation: weatherData.elevation,
                generationtime_ms: weatherData.generationtime_ms,
                hourly: {
                    temperature_2m: weatherData.hourly.temperature_2m,
                    time: weatherData.hourly.time
                },
                hourly_units: {
                    temperature_2m: weatherData.hourly_units.temperature_2m,
                    time: weatherData.hourly_units.time
                },
                latitude: weatherData.latitude,
                longitude: weatherData.longitude,
                timezone: weatherData.timezone,
                timezone_abbreviation: weatherData.timezone_abbreviation,
                utc_offset_seconds: weatherData.utc_offset_seconds
            },
        };

        console.log("Item:", item);

        // Store the data in DynamoDB
        await dynamodb
            .put({
                TableName: "cmtr-e4ed9c72-Weather-test",
                Item: item,
            })
            .promise();
        
        console.log("Item saved successfully");

    } catch (error) {
        console.error("Error:", error);
    }
};