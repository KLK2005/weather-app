    const API_KEY = 'c51c1c87f11c46b384c0237c6546455f';
    const BASE_WEATHER = 'https://api.openweathermap.org/data/2.5/weather';
    const BASE_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast';

    let currentUnit = 'metric';
    let currentWindUnit = 'kmh';
    let currentPrecipUnit = 'mm';
    let lastCity = 'Douala';
    let lastCoords = null;
    let forecastData = null;

    // Éléments du DOM
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const locationBtn = document.getElementById('locationBtn');
    const unitsBtn = document.getElementById('unitsBtn');
    const unitsMenu = document.getElementById('unitsMenu');
    const mainContent = document.getElementById('mainContent');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const retryBtn = document.getElementById('retryBtn');

    // Mappe les ID des conditions météorologiques aux emojis appropriés
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

    // Formate la date avec les noms de jours et de mois spécifiques à la locale
    function formatDate(timestamp, timezone = 0) {
      const date = new Date((timestamp + timezone) * 1000);
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    // Formate l'heure au format 12 heures avec AM/PM
    function formatTime(timestamp) {
      const date = new Date(timestamp * 1000);
      const hours = date.getHours();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours} ${period}`;
    }

    // Retourne le nom de jour abrégé (dim, lun, etc.)
    function getDayName(timestamp) {
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      return days[new Date(timestamp * 1000).getDay()];
    }

    // Affiche ou masque les états de l'interface (chargement, erreur ou contenu)
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

    // Formate la température avec l'unité selon la sélection actuelle
    function formatTemp(temp) {
      const rounded = Math.round(temp);
      const unit = currentUnit === 'metric' ? '°C' : '°F';
      return `${rounded}${unit}`;
    }

    // Formate la vitesse du vent avec conversion d'unité selon les paramètres actuels
    function formatWind(speed) {
      if (currentUnit === 'metric') {
        const kmh = Math.round(speed * 3.6);
        return currentWindUnit === 'kmh' ? `${kmh} km/h` : `${Math.round(speed * 2.237)} mph`;
      } else {
        return `${Math.round(speed)} mph`;
      }
    }

    // 🆕 Fonction de géolocalisation
    function getUserLocation() {
      if (!navigator.geolocation) {
        document.getElementById('errorMessage').textContent = 'La géolocalisation n\'est pas supportée par votre navigateur.';
        showState('error');
        return;
      }

      showState('loading');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          lastCoords = { lat, lon };
          fetchWeatherByCoords(lat, lon);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          let errorMessage = 'Impossible d\'obtenir votre position.';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Vous avez refusé l\'accès à votre position. Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Position non disponible.';
              break;
            case error.TIMEOUT:
              errorMessage = 'La demande de position a expiré.';
              break;
          }
          
          document.getElementById('errorMessage').textContent = errorMessage;
          showState('error');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }

    // 🆕 Récupérer la météo par coordonnées géographiques
    async function fetchWeatherByCoords(lat, lon) {
      try {
        showState('loading');

        const weatherRes = await fetch(
          `${BASE_WEATHER}?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`
        );
        
        if (!weatherRes.ok) {
          throw new Error('Échec de la récupération de la météo');
        }

        const weather = await weatherRes.json();
        const forecastRes = await fetch(
          `${BASE_FORECAST}?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`
        );
        const forecast = forecastRes.ok ? await forecastRes.json() : null;

        forecastData = forecast;
        lastCity = weather.name;
        lastCoords = { lat, lon };
        updateUI(weather, forecast);
        showState('content');

      } catch (error) {
        console.error('Error:', error);
        document.getElementById('errorMessage').textContent = error.message;
        showState('error');
      }
    }

    // Récupère les données météorologiques et de prévisions de l'API et met à jour l'interface
    async function fetchWeather(city) {
      try {
        showState('loading');

        const weatherRes = await fetch(`${BASE_WEATHER}?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`);
        
        if (!weatherRes.ok) {
          throw new Error(weatherRes.status === 404 ? 'Ville non trouvée' : 'Échec de la récupération de la météo');
        }

        const weather = await weatherRes.json();
        const forecastRes = await fetch(`${BASE_FORECAST}?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`);
        const forecast = forecastRes.ok ? await forecastRes.json() : null;

        forecastData = forecast;
        updateUI(weather, forecast);
        lastCity = city;
        lastCoords = { lat: weather.coord.lat, lon: weather.coord.lon };
        showState('content');

      } catch (error) {
        console.error('Error:', error);
        document.getElementById('errorMessage').textContent = error.message;
        showState('error');
      }
    }

    // Met à jour tous les éléments de l'interface avec les données météorologiques
    function updateUI(weather, forecast) {
      document.getElementById('locationName').textContent = `${weather.name}, ${weather.sys.country}`;
      document.getElementById('currentDate').textContent = formatDate(weather.dt, weather.timezone);
      document.getElementById('mainIcon').textContent = getWeatherIcon(weather.weather[0].id);
      document.getElementById('mainTemp').textContent = formatTemp(weather.main.temp);
      document.getElementById('feelsLike').textContent = formatTemp(weather.main.feels_like);
      document.getElementById('humidity').textContent = `${weather.main.humidity}%`;
      document.getElementById('wind').textContent = formatWind(weather.wind.speed);
      
      // Précipitations (l'API OpenWeather ne fournit pas les précipitations directes dans les conditions actuelles, on utilise donc les données de pluie/neige)
      const precip = weather.rain?.['1h'] || weather.snow?.['1h'] || 0;
      const precipValue = currentPrecipUnit === 'mm' ? precip.toFixed(1) : (precip / 25.4).toFixed(2);
      const precipUnit = currentPrecipUnit === 'mm' ? 'mm' : 'in';
      document.getElementById('precipitation').textContent = `${precipValue} ${precipUnit}`;

      // Met à jour les prévisions horaires avec la liste déroulante des jours
      if (forecast) {
        const daySelector = document.getElementById('daySelector');
        const hourlyList = document.getElementById('hourlyList');
        
        // Créer un objet pour grouper les données par jour
        const dailyDataMap = {};
        forecast.list.forEach(item => {
          const date = new Date(item.dt * 1000);
          const dayKey = date.toDateString();
          if (!dailyDataMap[dayKey]) {
            dailyDataMap[dayKey] = [];
          }
          dailyDataMap[dayKey].push(item);
        });

        // Mettre à jour la liste déroulante avec les jours disponibles
        const uniqueDays = Object.keys(dailyDataMap);
        daySelector.innerHTML = '<option value="0">Aujourd\'hui</option>';
        uniqueDays.slice(1).forEach((day, index) => {
          const date = new Date(day);
          const dayName = getDayName(date.getTime() / 1000);
          const option = document.createElement('option');
          option.value = index + 1;
          option.textContent = dayName;
          daySelector.appendChild(option);
        });

        // Fonction pour afficher les prévisions horaires du jour sélectionné
        function updateHourlyForecast(dayIndex) {
          hourlyList.innerHTML = '';
          const selectedDay = uniqueDays[dayIndex];
          const dayItems = dailyDataMap[selectedDay];
          
          dayItems.forEach(item => {
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
        }

        // Afficher les prévisions horaires du jour actuel par défaut
        updateHourlyForecast(0);

        // Ajouter l'événement de changement de jour
        daySelector.addEventListener('change', (e) => {
          updateHourlyForecast(parseInt(e.target.value));
        });

        // Met à jour les prévisions quotidiennes pour les 7 prochains jours, en calculant les températures min/max par jour
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

        Object.values(dailyData).slice(0, uniqueDays.length).forEach(day => {
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

    // Basculer la visibilité du menu déroulant des unités
    unitsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      unitsMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!unitsBtn.contains(e.target)) {
        unitsMenu.classList.remove('active');
      }
    });

    // Gérer la sélection d'unités et mettre à jour l'interface en conséquence
    document.querySelectorAll('.units-option').forEach(option => {
      option.addEventListener('click', () => {
        const type = option.getAttribute('data-type');
        const value = option.getAttribute('data-value');
        
        if (type === 'temp') {
          currentUnit = value;
          document.querySelectorAll('[data-type="temp"] .checkmark').forEach(c => c.style.display = 'none');
          option.querySelector('.checkmark').style.display = 'inline';
          
          // Recharger avec les nouvelles unités
          if (lastCoords) {
            fetchWeatherByCoords(lastCoords.lat, lastCoords.lon);
          } else {
            fetchWeather(lastCity);
          }
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

    // Rechercher une ville quand le bouton est cliqué ou que la touche Entrée est appuyée
    searchBtn.addEventListener('click', () => {
      const city = searchInput.value.trim();
      if (city) fetchWeather(city);
    });

    // Permettre à la touche Entrée de déclencher la recherche
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) fetchWeather(city);
      }
    });

    // Réessayer la dernière recherche quand l'utilisateur clique sur le bouton de réessai
    retryBtn.addEventListener('click', () => {
      fetchWeather(lastCity);
    });

    // 🆕 Géolocalisation quand l'utilisateur clique sur le bouton de localisation
    if (locationBtn) {
      locationBtn.addEventListener('click', getUserLocation);
    }

    // Initialiser l'application avec la ville par défaut
    fetchWeather('Douala');