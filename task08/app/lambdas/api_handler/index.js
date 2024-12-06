const axios = require('axios');

exports.handler = async (event) => {
    const latitude = event.queryStringParameters?.latitude || '50.4375';
    const longitude = event.queryStringParameters?.longitude || '30.5';

    const openMeteo = new OpenMeteoSDK();
    try {
        const weatherData = await openMeteo.getWeatherForecast(latitude, longitude);
        return {
            statusCode: 200,
            body: JSON.stringify(weatherData),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error fetching weather data' }),
        };
    }
};

class OpenMeteoSDK {
    constructor() {
        this.baseURL = 'https://api.open-meteo.com/v1/forecast';
    }

    async getWeatherForecast(latitude, longitude) {
        try {
            const response = await axios.get(this.baseURL, {
                params: {
                    latitude,
                    longitude,
                    hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m',
                    current_weather: true
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw new Error('Failed to retrieve weather forecast.');
        }
    }
}