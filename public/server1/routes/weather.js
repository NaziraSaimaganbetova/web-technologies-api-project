const express = require('express');
const router = express.Router();
const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

router.get('/', async (req, res) => {
    try {
        const { city } = req.query;
        
        if (!city) {
            return res.status(400).json({ error: 'City parameter is required' });
        }

        // Логируем запрос
        console.log(`Fetching weather for: ${city}`);
        console.log(`API Key present: ${!!OPENWEATHER_API_KEY}`);
        
        // Если нет API ключа, возвращаем демо-данные
        if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your_key_here') {
            console.log('Using demo data');
            const demoData = {
                city: city,
                country: "KZ",
                coordinates: {
                    lat: 43.2565,
                    lon: 76.9285
                },
                temperature: 15,
                feels_like: 14,
                humidity: 65,
                pressure: 1015,
                wind_speed: 3.5,
                description: "clear sky",
                icon: "01d",
                rain: 0,
                timestamp: new Date().toISOString()
            };
            return res.json(demoData);
        }

        // Иначе делаем реальный запрос
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        const weatherData = {
            city: response.data.name,
            country: response.data.sys.country,
            coordinates: {
                lat: response.data.coord.lat,
                lon: response.data.coord.lon
            },
            temperature: response.data.main.temp,
            feels_like: response.data.main.feels_like,
            humidity: response.data.main.humidity,
            pressure: response.data.main.pressure,
            wind_speed: response.data.wind.speed,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
            rain: response.data.rain ? response.data.rain['3h'] || 0 : 0,
            timestamp: new Date().toISOString()
        };

        console.log('Weather data fetched successfully');
        res.json(weatherData);
        
    } catch (error) {
        console.error('Weather API error details:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'City not found' });
        }
        
        // Если ошибка сети или API
        res.status(500).json({ 
            error: 'Failed to fetch weather data',
            details: error.message 
        });
    }
});

module.exports = router;