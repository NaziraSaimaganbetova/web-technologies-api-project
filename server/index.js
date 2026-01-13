require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const weatherRoutes = require('../public/server1/routes/weather');
const newsRoutes = require('../public/server1/routes/news');
const currencyRoutes = require('../public/server1/routes/currency');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/currency', currencyRoutes);

// Frontend route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});