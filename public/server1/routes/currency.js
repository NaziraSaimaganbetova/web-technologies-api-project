const express = require('express');
const router = express.Router();
const axios = require('axios');

const EXCHANGERATE_API_KEY = process.env.EXCHANGERATE_API_KEY;

router.get('/', async (req, res) => {
    try {
        const { base } = req.query;
        const baseCurrency = base || 'USD';

        console.log(`Currency request: base=${baseCurrency}, API key present: ${!!EXCHANGERATE_API_KEY}`);

        // Если нет API ключа или ключ дефолтный - используем демо-данные
        if (!EXCHANGERATE_API_KEY || EXCHANGERATE_API_KEY.includes('your_key')) {
            console.log('Using demo currency data');
            
            // Демо-данные для популярных валют
            const demoRates = {
                'USD': { USD: 1, EUR: 0.92, GBP: 0.79, KZT: 468.3, RUB: 89.2 },
                'EUR': { USD: 1.09, EUR: 1, GBP: 0.86, KZT: 510.5, RUB: 97.3 },
                'GBP': { USD: 1.27, EUR: 1.16, GBP: 1, KZT: 594.2, RUB: 113.1 },
                'KZT': { USD: 0.0021, EUR: 0.0020, GBP: 0.0017, KZT: 1, RUB: 0.19 },
                'JPY': { USD: 0.0069, EUR: 0.0064, GBP: 0.0055, KZT: 3.23, RUB: 0.62 }
            };
            
            const rates = demoRates[baseCurrency] || demoRates['USD'];
            
            const currencyData = {
                base_currency: baseCurrency,
                conversion_rates: rates,
                last_updated: new Date().toISOString(),
                note: 'Using demo data - get API key at exchangerate-api.com'
            };
            
            return res.json(currencyData);
        }

        // Реальный запрос к API
        const response = await axios.get(
            `https://v6.exchangerate-api.com/v6/${EXCHANGERATE_API_KEY}/latest/${baseCurrency}`,
            { timeout: 5000 }
        );

        console.log('Currency API response:', response.data.result);

        if (response.data.result === 'success') {
            const currencyData = {
                base_currency: response.data.base_code,
                conversion_rates: {
                    USD: response.data.conversion_rates.USD || 1,
                    EUR: response.data.conversion_rates.EUR || 0.92,
                    GBP: response.data.conversion_rates.GBP || 0.79,
                    JPY: response.data.conversion_rates.JPY || 144.5,
                    KZT: response.data.conversion_rates.KZT || 468.3,
                    RUB: response.data.conversion_rates.RUB || 89.2,
                    CNY: response.data.conversion_rates.CNY || 7.18
                },
                last_updated: response.data.time_last_update_utc || new Date().toISOString()
            };
            
            res.json(currencyData);
        } else {
            throw new Error('API returned error: ' + response.data['error-type']);
        }
        
    } catch (error) {
        console.error('Currency API error:', error.message);
        
        // Возвращаем демо-данные при ошибке
        const fallbackData = {
            base_currency: req.query.base || 'USD',
            conversion_rates: {
                USD: 1,
                EUR: 0.92,
                GBP: 0.79,
                KZT: 468.3,
                RUB: 89.2,
                JPY: 144.5,
                CNY: 7.18
            },
            last_updated: new Date().toISOString(),
            note: 'Fallback data due to API error'
        };
        
        res.json(fallbackData);
    }
});

module.exports = router;