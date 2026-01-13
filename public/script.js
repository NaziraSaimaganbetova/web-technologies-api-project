class WeatherApp {
    constructor() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.loading = document.getElementById('loading');
        
        // Weather elements
        this.cityName = document.getElementById('cityName');
        this.temperature = document.getElementById('temperature');
        this.weatherDescription = document.getElementById('weatherDescription');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.feelsLike = document.getElementById('feelsLike');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.pressure = document.getElementById('pressure');
        this.rain = document.getElementById('rain');
        this.country = document.getElementById('country');
        
        // Map elements
        this.mapLat = document.getElementById('mapLat');
        this.mapLon = document.getElementById('mapLon');
        this.mapImage = document.getElementById('mapImage');
        this.openstreetmapLink = document.getElementById('openstreetmapLink');
        this.googlemapsLink = document.getElementById('googlemapsLink');
        
        this.init();
    }
    
    init() {
        this.searchBtn.addEventListener('click', () => this.searchCity());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchCity();
        });
        
        // Focus on input
        this.cityInput.focus();
        
        // Load default city
        setTimeout(() => {
            this.searchCity('Almaty');
        }, 500);
    }
    
    async searchCity(city = null) {
        const cityName = city || this.cityInput.value.trim();
        
        if (!cityName) {
            this.showNotification('Please enter a city name', 'warning');
            return;
        }
        
        this.showLoading();
        
        try {
            // Fetch weather data
            const weatherData = await this.fetchWeatherData(cityName);
            this.updateWeatherUI(weatherData);
            
            // Update map with coordinates
            this.updateMapUI(weatherData.coordinates.lat, weatherData.coordinates.lon, weatherData.city);
            
            // Fetch news for the country
            await this.fetchNews(weatherData.country);
            
            // Fetch currency data
            await this.fetchCurrencyData(weatherData.country);
            
            this.showNotification(`Weather data loaded for ${weatherData.city}`, 'success');
            
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Failed to fetch data. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async fetchWeatherData(city) {
        console.log(`Fetching weather for: ${city}`);
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Weather API error: ${response.status}`, errorText);
            throw new Error(`Failed to fetch weather: ${response.status}`);
        }
        
        return await response.json();
    }
    
    async fetchNews(countryCode) {
        try {
            console.log(`Fetching news for country: ${countryCode}`);
            const response = await fetch(`/api/news?country=${countryCode.toLowerCase()}`);
            
            if (!response.ok) {
                console.warn('News API failed, using mock data');
                return this.useMockNews(countryCode);
            }
            
            const data = await response.json();
            console.log('News data received:', data);
            this.updateNewsUI(data.articles || []);
        } catch (error) {
            console.error('Failed to fetch news:', error);
            this.useMockNews(countryCode);
        }
    }
    
    useMockNews(countryCode) {
        const countryNames = {
            'KZ': 'Kazakhstan', 'US': 'United States', 'GB': 'United Kingdom',
            'JP': 'Japan', 'CN': 'China', 'RU': 'Russia', 'DE': 'Germany',
            'FR': 'France', 'IT': 'Italy', 'ES': 'Spain', 'CA': 'Canada'
        };
        
        const countryName = countryNames[countryCode] || 'the region';
        
        const mockNews = {
            articles: [
                {
                    title: `Weather Updates for ${countryName}`,
                    description: `Latest weather forecasts and climate news for ${countryName}. Stay informed about changing conditions.`,
                    url: "#",
                    source: "Weather Network",
                    publishedAt: new Date().toISOString()
                },
                {
                    title: "Climate Technology Innovations",
                    description: "New advancements in weather prediction technology are helping communities prepare better.",
                    url: "#",
                    source: "Tech News",
                    publishedAt: new Date().toISOString()
                },
                {
                    title: "Global Weather Patterns",
                    description: "Recent studies show interesting patterns in global weather changes across different regions.",
                    url: "#",
                    source: "Science Daily",
                    publishedAt: new Date().toISOString()
                }
            ]
        };
        this.updateNewsUI(mockNews.articles);
    }
    
    async fetchCurrencyData(countryCode) {
        try {
            console.log(`Fetching currency for country: ${countryCode}`);
            
            let baseCurrency = 'USD';
            const currencyMap = {
                'KZ': 'KZT', 'RU': 'RUB', 'GB': 'GBP', 
                'JP': 'JPY', 'CN': 'CNY', 'DE': 'EUR',
                'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR',
                'US': 'USD', 'CA': 'CAD', 'AU': 'AUD'
            };
            
            if (currencyMap[countryCode]) {
                baseCurrency = currencyMap[countryCode];
            }
            
            const response = await fetch(`/api/currency?base=${baseCurrency}`);
            
            if (!response.ok) {
                throw new Error(`Currency API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Currency data received:', data);
            this.updateCurrencyUI(data, countryCode);
            
        } catch (error) {
            console.error('Failed to fetch currency data:', error);
            this.useMockCurrency(countryCode);
        }
    }
    
    useMockCurrency(countryCode) {
        // Map country codes to their currencies
        const currencyMap = {
            'KZ': { code: 'KZT', name: 'Kazakh Tenge', flag: '🇰🇿', rates: { USD: 0.0021, EUR: 0.0020, RUB: 0.19 } },
            'RU': { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', rates: { USD: 0.011, EUR: 0.010, KZT: 5.26 } },
            'GB': { code: 'GBP', name: 'British Pound', flag: '🇬🇧', rates: { USD: 1.27, EUR: 1.16, KZT: 594.2 } },
            'JP': { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', rates: { USD: 0.0069, EUR: 0.0064, KZT: 3.23 } },
            'CN': { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', rates: { USD: 0.14, EUR: 0.13, KZT: 65.2 } },
            'US': { code: 'USD', name: 'US Dollar', flag: '🇺🇸', rates: { EUR: 0.92, GBP: 0.79, KZT: 468.3 } },
            'EU': { code: 'EUR', name: 'Euro', flag: '🇪🇺', rates: { USD: 1.09, GBP: 0.86, KZT: 510.5 } }
        };
        
        const currencyInfo = currencyMap[countryCode] || currencyMap['US'];
        
        const mockData = {
            base_currency: currencyInfo.code,
            conversion_rates: {
                USD: currencyInfo.rates.USD || 1,
                EUR: currencyInfo.rates.EUR || 0.92,
                GBP: currencyInfo.rates.GBP || 0.79,
                JPY: 144.5,
                KZT: currencyInfo.rates.KZT || 468.3,
                RUB: currencyInfo.rates.RUB || 89.2,
                CNY: 7.18
            },
            last_updated: new Date().toISOString(),
            note: 'Demo currency data'
        };
        
        this.updateCurrencyUI(mockData, countryCode);
    }
    
    updateWeatherUI(data) {
        console.log('Updating weather UI with:', data);
        
        this.cityName.textContent = `${data.city}, ${data.country}`;
        this.temperature.textContent = Math.round(data.temperature);
        this.weatherDescription.textContent = data.description.charAt(0).toUpperCase() + data.description.slice(1);
        this.feelsLike.textContent = Math.round(data.feels_like);
        this.humidity.textContent = data.humidity;
        this.windSpeed.textContent = data.wind_speed;
        this.pressure.textContent = data.pressure;
        this.rain.textContent = data.rain || 0;
        this.country.textContent = data.country;
        
        // Update weather icon
        const iconCode = data.icon;
        this.weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
                                      alt="${data.description}" 
                                      style="width: 80px; height: 80px;">`;
    }
    
    updateMapUI(lat, lon, cityName) {
        // Update coordinates display
        this.mapLat.textContent = lat.toFixed(4) + '°';
        this.mapLon.textContent = lon.toFixed(4) + '°';
        
        // Update map image (using static map service)
        const mapUrl = `https://static-maps.yandex.ru/1.x/?ll=${lon},${lat}&size=600,400&z=12&l=map&pt=${lon},${lat},pm2rdl`;
        this.mapImage.src = mapUrl;
        this.mapImage.alt = `Map of ${cityName}`;
        
        // Update map links
        this.openstreetmapLink.href = `https://www.openstreetmap.org/#map=12/${lat}/${lon}`;
        this.googlemapsLink.href = `https://www.google.com/maps/@${lat},${lon},12z`;
    }
    
    updateNewsUI(articles) {
        const newsContainer = document.getElementById('newsContainer');
        newsContainer.innerHTML = '';
        
        if (!articles || articles.length === 0) {
            newsContainer.innerHTML = '<p class="no-news">No news available at the moment</p>';
            return;
        }
        
        articles.forEach(article => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <h4>${article.title || 'No title available'}</h4>
                <p>${article.description || 'No description available'}</p>
                <div class="news-footer">
                    ${article.source ? `<span class="news-source"><i class="fas fa-newspaper"></i> ${article.source}</span>` : ''}
                    ${article.url && article.url !== '#' ? `<a href="${article.url}" target="_blank" class="read-more">Read more <i class="fas fa-external-link-alt"></i></a>` : ''}
                </div>
            `;
            newsContainer.appendChild(newsItem);
        });
    }
    
    updateCurrencyUI(data, countryCode) {
        const currencyInfo = document.getElementById('currencyInfo');
        
        if (!data || !data.conversion_rates) {
            currencyInfo.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2em; color: #ff6b6b; margin-bottom: 10px;"></i>
                    <h3>Currency Data Unavailable</h3>
                    <p>Unable to load currency exchange rates at this time.</p>
                </div>
            `;
            return;
        }
        
        let ratesHTML = '';
        const baseCurrency = data.base_currency || 'USD';
        const rates = data.conversion_rates;
        
        // Показываем основные валюты
        const displayCurrencies = [
            { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
            { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
            { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
            { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
            { code: 'KZT', name: 'Kazakh Tenge', flag: '🇰🇿' },
            { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
            { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' }
        ];
        
        displayCurrencies.forEach(currency => {
            if (rates[currency.code] && currency.code !== baseCurrency) {
                const rate = rates[currency.code];
                const formattedRate = typeof rate === 'number' ? rate.toFixed(4) : rate;
                
                ratesHTML += `
                    <div class="rate-item">
                        <div class="currency-info">
                            <span class="currency-flag">${currency.flag}</span>
                            <span class="currency-name">${currency.name}</span>
                        </div>
                        <div class="currency-rate">
                            <strong>${formattedRate} ${currency.code}</strong>
                        </div>
                    </div>
                `;
            }
        });
        
        // Если нет данных для отображения
        if (!ratesHTML) {
            ratesHTML = '<p style="color: rgba(255,255,255,0.8); text-align: center; padding: 20px;">No currency rates available</p>';
        }
        
        // Get flag for base currency
        const getFlag = (code) => {
            const flags = {
                'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵',
                'KZT': '🇰🇿', 'RUB': '🇷🇺', 'CNY': '🇨🇳', 'CAD': '🇨🇦',
                'AUD': '🇦🇺'
            };
            return flags[code] || '💰';
        };
        
        currencyInfo.innerHTML = `
            <div class="currency-header">
                <h3><i class="fas fa-chart-line"></i> Exchange Rates</h3>
                <div class="base-currency">
                    <span class="base-flag">${getFlag(baseCurrency)}</span>
                    <strong>${baseCurrency}</strong>
                </div>
            </div>
            
            <p class="update-time">
                <i class="far fa-clock"></i> 
                ${new Date(data.last_updated || new Date()).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </p>
            
            ${data.note ? `<div class="currency-note"><i class="fas fa-info-circle"></i> ${data.note}</div>` : ''}
            
            <div class="currency-rates">
                ${ratesHTML}
            </div>
            
            <div class="currency-footer">
                <small>Base currency: 1 ${baseCurrency}</small>
            </div>
        `;
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add styles for notification
        if (!document.querySelector('.notification')) {
            const style = document.createElement('style');
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 10px;
                    color: white;
                    font-weight: 500;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 300px;
                    max-width: 400px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                }
                .notification-success { background: linear-gradient(135deg, #4CAF50, #2E7D32); }
                .notification-error { background: linear-gradient(135deg, #F44336, #C62828); }
                .notification-warning { background: linear-gradient(135deg, #FF9800, #EF6C00); }
                .notification-info { background: linear-gradient(135deg, #2196F3, #1565C0); }
                .notification button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    margin-left: 15px;
                    opacity: 0.8;
                }
                .notification button:hover { opacity: 1; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    showLoading() {
        if (this.loading) {
            this.loading.style.display = 'flex';
        }
    }
    
    hideLoading() {
        if (this.loading) {
            this.loading.style.display = 'none';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new WeatherApp();
        console.log('Weather Dashboard initialized successfully!');
    } catch (error) {
        console.error('Error initializing Weather App:', error);
        alert('Error loading application. Please check console for details.');
    }
});

// Добавим функцию для обновления карты при ошибке загрузки изображения
document.addEventListener('DOMContentLoaded', function() {
    const mapImage = document.getElementById('mapImage');
    if (mapImage) {
        mapImage.onerror = function() {
            this.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
        };
    }
}); 