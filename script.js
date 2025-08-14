const BASE_URL = "https://api.weatherapi.com/v1";

// DOM Elements
const elements = {
    themeToggle: document.getElementById('theme-toggle'),
    locationInput: document.getElementById('location-input'),
    searchBtn: document.getElementById('search-btn'),
    errorMessage: document.getElementById('error-message'),
    loading: document.getElementById('loading'),
    weatherDisplay: document.getElementById('weather-display'),
    
    // Location Info
    cityName: document.getElementById('city-name'),
    region: document.getElementById('region'),
    localTime: document.getElementById('local-time'),
    coordinates: document.getElementById('coordinates'),
    
    // Current Weather
    weatherIcon: document.getElementById('weather-icon'),
    weatherCondition: document.getElementById('weather-condition'),
    temperature: document.getElementById('temperature'),
    feelsLike: document.getElementById('feels-like'),
    
    // Weather Details
    windSpeed: document.getElementById('wind-speed'),
    humidity: document.getElementById('humidity'),
    precipitation: document.getElementById('precipitation'),
    
    // Weather Stats
    windDirectionArrow: document.getElementById('wind-direction-arrow'),
    windDirection: document.getElementById('wind-direction'),
    windSpeedDetail: document.getElementById('wind-speed-detail'),
    windGust: document.getElementById('wind-gust'),
    humidityLevel: document.getElementById('humidity-level'),
    humidityPercent: document.getElementById('humidity-percent'),
    humidityStatus: document.getElementById('humidity-status'),
    uvIndex: document.getElementById('uv-index'),
    uvLevel: document.getElementById('uv-level'),
    uvStatus: document.getElementById('uv-status'),
    visibility: document.getElementById('visibility'),
    visibilityLevel: document.getElementById('visibility-level'),
    visibilityStatus: document.getElementById('visibility-status'),
    cloudCover: document.getElementById('cloud-cover'),
    pressure: document.getElementById('pressure'),
    lastUpdated: document.getElementById('last-updated')
};

// Theme Management
function setTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Check for saved theme preference or use system preference
const savedTheme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(savedTheme === 'dark');
elements.themeToggle.checked = savedTheme === 'light';

// Theme toggle event
elements.themeToggle.addEventListener('change', (e) => {
    setTheme(!e.target.checked);
});

// Fetch Weather Data
async function fetchWeatherData(location) {
    try {
        showLoading(true);
        clearError();
        
        const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${location}&aqi=no`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        updateWeatherUI(data);
        showWeatherDisplay();
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Update UI with Weather Data
function updateWeatherUI(data) {
    const { location, current } = data;
    
    // Location Info
    elements.cityName.textContent = location.name;
    elements.region.textContent = `${location.region ? location.region + ', ' : ''}${location.country}`;
    elements.localTime.textContent = `Local Time: ${location.localtime}`;
    elements.coordinates.textContent = `${location.lat}°, ${location.lon}°`;
    
    // Current Weather
    elements.weatherIcon.src = `https:${current.condition.icon.replace('64x64', '128x128')}`;
    elements.weatherIcon.alt = current.condition.text;
    elements.weatherCondition.textContent = current.condition.text;
    elements.temperature.textContent = `${Math.round(current.temp_c)}°C`;
    elements.feelsLike.textContent = `Feels like ${Math.round(current.feelslike_c)}°C`;
    
    // Weather Details
    elements.windSpeed.textContent = `${current.wind_kph} km/h`;
    elements.humidity.textContent = `${current.humidity}%`;
    elements.precipitation.textContent = `${current.precip_mm} mm`;
    
    // Wind Stats
    elements.windDirectionArrow.style.transform = `rotate(${current.wind_degree}deg)`;
    elements.windDirection.textContent = current.wind_dir;
    elements.windSpeedDetail.textContent = `${current.wind_kph} km/h`;
    elements.windGust.textContent = `${current.gust_kph} km/h`;
    
    // Humidity Stats
    elements.humidityLevel.style.width = `${current.humidity}%`;
    elements.humidityPercent.textContent = `${current.humidity}%`;
    elements.humidityStatus.textContent = getHumidityStatus(current.humidity);
    
    // UV Index Stats
    elements.uvIndex.textContent = current.uv;
    elements.uvLevel.style.width = `${Math.min(current.uv * 10, 100)}%`;
    elements.uvStatus.textContent = getUVStatus(current.uv);
    
    // Visibility Stats
    elements.visibility.textContent = `${current.vis_km} km`;
    elements.visibilityLevel.style.width = `${Math.min(current.vis_km * 5, 100)}%`;
    elements.visibilityStatus.textContent = getVisibilityStatus(current.vis_km);
    
    // Additional Info
    elements.cloudCover.textContent = `${current.cloud}%`;
    elements.pressure.textContent = `${current.pressure_mb} mb`;
    elements.lastUpdated.textContent = `Last updated: ${current.last_updated}`;
}

// Helper Functions
function getHumidityStatus(humidity) {
    if (humidity < 30) return 'Dry';
    if (humidity < 60) return 'Comfortable';
    if (humidity < 80) return 'Humid';
    return 'Very Humid';
}

function getUVStatus(uvIndex) {
    if (uvIndex <= 2) return 'Low - No protection needed';
    if (uvIndex <= 5) return 'Moderate - Stay in shade near midday';
    if (uvIndex <= 7) return 'High - Wear sunscreen and protective clothing';
    if (uvIndex <= 10) return 'Very High - Extra protection needed';
    return 'Extreme - Avoid sun exposure';
}

function getVisibilityStatus(visibility) {
    if (visibility > 10) return 'Excellent visibility';
    if (visibility > 5) return 'Good visibility';
    if (visibility > 2) return 'Moderate visibility';
    return 'Poor visibility';
}

// UI State Management
function showLoading(show) {
    elements.loading.classList.toggle('hidden', !show);
}

function showWeatherDisplay() {
    elements.weatherDisplay.classList.remove('hidden');
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.weatherDisplay.classList.add('hidden');
}

function clearError() {
    elements.errorMessage.textContent = '';
}

// Event Listeners
elements.searchBtn.addEventListener('click', () => {
    const location = elements.locationInput.value.trim();
    if (location) {
        fetchWeatherData(location);
    } else {
        showError('Please enter a location');
    }
});

elements.locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const location = elements.locationInput.value.trim();
        if (location) {
            fetchWeatherData(location);
        } else {
            showError('Please enter a location');
        }
    }
});

// Initialize with default location
fetchWeatherData('London');
