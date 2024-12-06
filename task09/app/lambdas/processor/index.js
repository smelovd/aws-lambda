const axios = require('axios');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const WEATHER_TABLE = "Weather";

exports.handler = async (event) => {
  try {
    const { latitude, longitude } = event.queryStringParameters || {};

    if (!latitude || !longitude) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing 'latitude' or 'longitude' parameter" }),
      };
    }

    // Fetch weather data from Open-Meteo API
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude,
        longitude,
        hourly: "temperature_2m,time",
      },
    });

    const weatherData = response.data;

    // Prepare the item to store in DynamoDB
    const item = {
      id: uuidv4(),
      forecast: weatherData,
    };

    // Store data in DynamoDB
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
