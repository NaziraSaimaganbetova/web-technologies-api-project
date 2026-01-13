const express = require('express');
const router = express.Router();
const axios = require('axios');

const NEWS_API_KEY = process.env.NEWS_API_KEY;

router.get('/', async (req, res) => {
    try {
        const { country } = req.query;
        
        if (!country) {
            return res.status(400).json({ error: 'Country parameter is required' });
        }

        const response = await axios.get(
            `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${NEWS_API_KEY}&pageSize=5`
        );

        const news = response.data.articles.map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            image: article.urlToImage,
            source: article.source.name,
            publishedAt: article.publishedAt
        }));

        res.json({ articles: news });
    } catch (error) {
        console.error('News API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

module.exports = router;