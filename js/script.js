    const API_KEY = 'c51c1c87f11c46b384c0237c6546455f';
    const BASE_WEATHER = 'https://api.openweathermap.org/data/2.5/weather';
    const BASE_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast';

    let currentUnit = 'metric';
    let currentWindUnit = 'kmh';
    let currentPrecipUnit = 'mm';
    let lastCity = 'Berlin';
    let forecastData = null;

    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const unitsBtn = document.getElementById('unitsBtn');
    const unitsMenu = document.getElementById('unitsMenu');
    const mainContent = document.getElementById('mainContent');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const retryBtn = document.getElementById('retryBtn');

    // Weather icon mapping
    function getWeatherIcon(id, isDay = true) {
      if (id >= 200 && id < 300) return '⛈️';
      if (id >= 300 && id < 600) return '🌧️';
      if (id >= 600 && id < 700) return '🌨️';
      if (id >= 700 && id < 800) return '🌫️';
      if (id === 800) return isDay ? '☀️' : '🌙';
      if (id === 801) return isDay ? '⛅' : '☁️';
      if (id >= 802) return '☁️';
      return '☀️';
    }

    // Format date
    function formatDate(timestamp, timezone = 0) {
      const date = new Date((timestamp + timezone) * 1000);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    function formatTime(timestamp) {
      const date = new Date(timestamp * 1000);
      const hours = date.getHours();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours} ${period}`;
    }

    function getDayName(timestamp) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[new Date(timestamp * 1000).getDay()];
    }

    // Show/hide states
    function showState(state) {
      loadingState.classList.add('hidden');
      errorState.classList.add('hidden');
      mainContent.style.display = 'none';

      if (state === 'loading') {
        loadingState.classList.remove('hidden');
      } else if (state === 'error') {
        errorState.classList.remove('hidden');
      } else if (state === 'content') {
        mainContent.style.display = 'grid';
      }
    }

    // Format temperature
    function formatTemp(temp) {
      const rounded = Math.round(temp);
      const unit = currentUnit === 'metric' ? '°C' : '°F';
      return `${rounded}${unit}`;
    }

    // Format wind speed
    function formatWind(speed) {
      if (currentUnit === 'metric') {
        const kmh = Math.round(speed * 3.6);
        return currentWindUnit === 'kmh' ? `${kmh} km/h` : `${Math.round(speed * 2.237)} mph`;
      } else {
        return `${Math.round(speed)} mph`;
      }
    }

    // Fetch weather data
    async function fetchWeather(city) {
      try {
        showState('loading');

        const weatherRes = await fetch(`${BASE_WEATHER}?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`);
        
        if (!weatherRes.ok) {
          throw new Error(weatherRes.status === 404 ? 'City not found' : 'Failed to fetch weather');
        }

        const weather = await weatherRes.json();
        const forecastRes = await fetch(`${BASE_FORECAST}?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`);
        const forecast = forecastRes.ok ? await forecastRes.json() : null;

        forecastData = forecast;
        updateUI(weather, forecast);
        lastCity = city;
        showState('content');

      } catch (error) {
        console.error('Error:', error);
        document.getElementById('errorMessage').textContent = error.message;
        showState('error');
      }
    }

    // Update UI with weather data
    function updateUI(weather, forecast) {
      document.getElementById('locationName').textContent = `${weather.name}, ${weather.sys.country}`;
      document.getElementById('currentDate').textContent = formatDate(weather.dt, weather.timezone);
      document.getElementById('mainIcon').textContent = getWeatherIcon(weather.weather[0].id);
      document.getElementById('mainTemp').textContent = formatTemp(weather.main.temp);
      document.getElementById('feelsLike').textContent = formatTemp(weather.main.feels_like);
      document.getElementById('humidity').textContent = `${weather.main.humidity}%`;
      document.getElementById('wind').textContent = formatWind(weather.wind.speed);
      
      // Precipitation (OpenWeather doesn't provide direct precipitation in current weather)
      const precip = weather.rain?.['1h'] || weather.snow?.['1h'] || 0;
      const precipValue = currentPrecipUnit === 'mm' ? precip.toFixed(1) : (precip / 25.4).toFixed(2);
      const precipUnit = currentPrecipUnit === 'mm' ? 'mm' : 'in';
      document.getElementById('precipitation').textContent = `${precipValue} ${precipUnit}`;

      // Update hourly forecast
      if (forecast) {
        const hourlyList = document.getElementById('hourlyList');
        hourlyList.innerHTML = '';
        
        forecast.list.slice(0, 8).forEach(item => {
          const div = document.createElement('div');
          div.className = 'hourly-item';
          div.innerHTML = `
            <div class="hourly-time">
              <span class="hourly-icon-small">${getWeatherIcon(item.weather[0].id)}</span>
              <span>${formatTime(item.dt)}</span>
            </div>
            <div class="hourly-temp">${formatTemp(item.main.temp)}</div>
          `;
          hourlyList.appendChild(div);
        });

        // Update daily forecast
        const dailyGrid = document.getElementById('dailyGrid');
        dailyGrid.innerHTML = '';
        
        const dailyData = {};
        forecast.list.forEach(item => {
          const day = new Date(item.dt * 1000).toDateString();
          if (!dailyData[day]) {
            dailyData[day] = { temps: [], weather: item.weather[0], dt: item.dt };
          }
          dailyData[day].temps.push(item.main.temp);
        });

        Object.values(dailyData).slice(0, 7).forEach(day => {
          const maxTemp = Math.max(...day.temps);
          const minTemp = Math.min(...day.temps);
          
          const div = document.createElement('div');
          div.className = 'daily-item';
          div.innerHTML = `
            <div class="daily-day">${getDayName(day.dt)}</div>
            <div class="daily-icon">${getWeatherIcon(day.weather.id)}</div>
            <div class="daily-temps">
              <span class="temp-high">${Math.round(maxTemp)}°</span>
              <span class="temp-low">${Math.round(minTemp)}°</span>
            </div>
          `;
          dailyGrid.appendChild(div);
        });
      }
    }

    // Units menu toggle
    unitsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      unitsMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!unitsBtn.contains(e.target)) {
        unitsMenu.classList.remove('active');
      }
    });

    // Units selection
    document.querySelectorAll('.units-option').forEach(option => {
      option.addEventListener('click', () => {
        const type = option.getAttribute('data-type');
        const value = option.getAttribute('data-value');
        
        if (type === 'temp') {
          currentUnit = value;
          document.querySelectorAll('[data-type="temp"] .checkmark').forEach(c => c.style.display = 'none');
          option.querySelector('.checkmark').style.display = 'inline';
          fetchWeather(lastCity);
        } else if (type === 'wind') {
          currentWindUnit = value;
          document.querySelectorAll('[data-type="wind"] .checkmark').forEach(c => c.style.display = 'none');
          option.querySelector('.checkmark').style.display = 'inline';
          if (forecastData) {
            const weather = { wind: { speed: parseFloat(document.getElementById('wind').textContent) } };
            document.getElementById('wind').textContent = formatWind(weather.wind.speed);
          }
        } else if (type === 'precip') {
          currentPrecipUnit = value;
          document.querySelectorAll('[data-type="precip"] .checkmark').forEach(c => c.style.display = 'none');
          option.querySelector('.checkmark').style.display = 'inline';
        }
      });
    });

    // Search functionality
    searchBtn.addEventListener('click', () => {
      const city = searchInput.value.trim();
      if (city) fetchWeather(city);
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) fetchWeather(city);
      }
    });

    // Retry button
    retryBtn.addEventListener('click', () => {
      fetchWeather(lastCity);
    });

    // Initialize
    fetchWeather('Berlin');