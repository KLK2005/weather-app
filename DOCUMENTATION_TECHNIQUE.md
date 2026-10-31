# 📚 Documentation Technique - Application Météo

## 🎯 Présentation du Projet

Application web météorologique permettant d'afficher les conditions météorologiques actuelles et les prévisions pour n'importe quelle ville dans le monde, avec support de la géolocalisation.

**URL du projet** : https://klk2005.github.io/weather-app/

---

## 🛠️ Technologies Utilisées

### Langages de Programmation
- **HTML5** : Structure de la page web
- **CSS3** : Mise en forme et animations
- **JavaScript (Vanilla)** : Logique applicative et interaction avec l'API

### API Externe
- **OpenWeatherMap API** : Service de données météorologiques
  - API Current Weather : Données météo actuelles
  - API 5 Day Forecast : Prévisions sur 5 jours

### Protocoles Web
- **HTTPS** : Protocole sécurisé requis pour la géolocalisation
- **REST API** : Architecture pour les appels API
- **JSON** : Format d'échange de données

---

## 📁 Architecture du Projet

```
weather-app/
│
├── index.html              # Page principale de l'application
├── css/
│   └── style.css          # Feuille de styles
├── js/
│   └── script.js          # Logique JavaScript
├── assets/
│   ├── images/            # Images et icônes
│   └── fonts/             # Polices personnalisées
└── design/                # Maquettes de design
```

---

## 🔧 Composants Principaux

### 1. **HTML - Structure (index.html)**

#### Composants de la page :

**En-tête (Header)**
```html
<header>
  <div class="logo">Météo</div>
  <div class="units-btn">Unités</div>
</header>
```
- Logo de l'application
- Menu déroulant pour changer les unités (Celsius/Fahrenheit, km/h/mph, mm/in)

**Section Hero (Recherche)**
```html
<div class="hero">
  <h1>Comment est le ciel aujourd'hui ?</h1>
  <input id="searchInput" placeholder="Rechercher un endroit...">
  <button id="searchBtn">Rechercher</button>
  <button id="locationBtn">📍</button>
</div>
```
- Titre de la page
- Champ de recherche pour entrer une ville
- Bouton de recherche
- Bouton de géolocalisation (📍)

**Carte Météo Principale**
```html
<div class="weather-card">
  <div id="locationName">Douala, Cameroon</div>
  <div id="currentDate">Tuesday, Aug 5, 2025</div>
  <div id="mainIcon">☀️</div>
  <div id="mainTemp">68°</div>
</div>
```
- Nom de la ville et pays
- Date actuelle
- Icône météo
- Température actuelle

**Détails Météorologiques**
```html
<div class="weather-details">
  <div id="feelsLike">64°</div>      <!-- Température ressentie -->
  <div id="humidity">46%</div>       <!-- Humidité -->
  <div id="wind">9 mph</div>         <!-- Vitesse du vent -->
  <div id="precipitation">0 in</div> <!-- Précipitations -->
</div>
```

**Prévisions Quotidiennes**
```html
<div class="daily-forecast">
  <div id="dailyGrid"><!-- Prévisions 7 jours --></div>
</div>
```

**Prévisions Horaires**
```html
<div class="hourly-panel">
  <select id="daySelector"><!-- Sélecteur de jour --></select>
  <div id="hourlyList"><!-- Liste des heures --></div>
</div>
```

**États de l'Application**
```html
<!-- État de chargement -->
<div id="loadingState">
  <div class="spinner"></div>
</div>

<!-- État d'erreur -->
<div id="errorState">
  <p id="errorMessage">Une erreur s'est produite.</p>
  <button id="retryBtn">Réessayer</button>
</div>
```

---

### 2. **CSS - Styles (css/style.css)**

#### Techniques CSS Utilisées :

**Variables CSS**
```css
:root {
  --primary-color: #5B7FFF;
  --bg-gradient: linear-gradient(180deg, #0B1B3D 0%, #050B1A 100%);
}
```

**Flexbox pour la mise en page**
```css
.search-container {
  display: flex;
  gap: 12px;
  align-items: center;
}
```

**Grid Layout pour les prévisions**
```css
.main-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}
```

**Animations et Transitions**
```css
.search-btn {
  transition: all 0.3s;
}

.search-btn:hover {
  transform: translateY(-2px);
}
```

**Responsive Design**
```css
@media (max-width: 768px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}
```

**Effets visuels**
- Dégradés (gradients)
- Ombres (box-shadow)
- Transparence (rgba)
- Border-radius pour coins arrondis

---

### 3. **JavaScript - Logique (js/script.js)**

#### 3.1 Variables Globales

```javascript
const API_KEY = 'c51c1c87f11c46b384c0237c6546455f';
const BASE_WEATHER = 'https://api.openweathermap.org/data/2.5/weather';
const BASE_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast';

let currentUnit = 'metric';      // Unité actuelle (metric/imperial)
let currentWindUnit = 'kmh';     // Unité de vent (kmh/mph)
let currentPrecipUnit = 'mm';    // Unité de précipitation (mm/in)
let lastCity = 'Douala';         // Dernière ville recherchée
let lastCoords = null;           // Dernières coordonnées GPS
let forecastData = null;         // Données de prévisions
```

#### 3.2 Sélection des Éléments DOM

```javascript
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const unitsBtn = document.getElementById('unitsBtn');
const mainContent = document.getElementById('mainContent');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
```

**Explication** : 
- `document.getElementById()` : Méthode JavaScript pour sélectionner un élément HTML par son ID
- Ces variables stockent des références aux éléments DOM pour manipulation ultérieure

#### 3.3 Fonctions Utilitaires

**1. Fonction getWeatherIcon()**
```javascript
function getWeatherIcon(id, isDay = true) {
  if (id >= 200 && id < 300) return '⛈️';  // Orage
  if (id >= 300 && id < 600) return '🌧️';  // Pluie
  if (id >= 600 && id < 700) return '🌨️';  // Neige
  if (id >= 700 && id < 800) return '🌫️';  // Brouillard
  if (id === 800) return isDay ? '☀️' : '🌙';  // Dégagé
  if (id >= 801) return '☁️';  // Nuageux
}
```
**Explication** :
- Prend l'ID de condition météo de l'API OpenWeatherMap
- Retourne l'emoji correspondant
- Utilise des conditions if pour mapper les codes API aux emojis

**2. Fonction formatDate()**
```javascript
function formatDate(timestamp, timezone = 0) {
  const date = new Date((timestamp + timezone) * 1000);
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
```
**Explication** :
- **Classe Date** : Classe JavaScript native pour manipuler dates et heures
- `new Date(timestamp * 1000)` : Convertit timestamp Unix (secondes) en millisecondes
- `date.getDay()` : Retourne le jour de la semaine (0-6)
- `date.getDate()` : Retourne le jour du mois (1-31)
- Arrays `days` et `months` : Stockent les noms en français

**3. Fonction formatTime()**
```javascript
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours} ${period}`;
}
```
**Explication** :
- Convertit l'heure 24h en format 12h avec AM/PM
- **Opérateur ternaire** : `condition ? valeur_si_vrai : valeur_si_faux`
- **Modulo (%)** : Opération mathématique pour obtenir le reste de la division
- `hours % 12 || 12` : Si reste = 0, retourne 12 (minuit/midi)

**4. Fonction showState()**
```javascript
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
```
**Explication** :
- Gère l'affichage des différents états de l'application
- **classList.add()** : Ajoute une classe CSS à un élément
- **classList.remove()** : Retire une classe CSS d'un élément
- **style.display** : Modifie la propriété CSS display directement

#### 3.4 API - Récupération des Données

**1. Fonction fetchWeather() - Recherche par ville**
```javascript
async function fetchWeather(city) {
  try {
    showState('loading');
    
    const weatherRes = await fetch(
      `${BASE_WEATHER}?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`
    );
    
    if (!weatherRes.ok) {
      throw new Error(weatherRes.status === 404 ? 'Ville non trouvée' : 'Échec de la récupération');
    }

    const weather = await weatherRes.json();
    const forecastRes = await fetch(
      `${BASE_FORECAST}?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${API_KEY}`
    );
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
```

**Concepts expliqués** :

**a) Async/Await**
```javascript
async function fetchWeather(city) {
  const response = await fetch(url);
}
```
- `async` : Déclare une fonction asynchrone
- `await` : Attend la résolution d'une Promise avant de continuer
- Permet d'écrire du code asynchrone de manière synchrone (plus lisible)

**b) Fetch API**
```javascript
const response = await fetch(url);
```
- Méthode JavaScript moderne pour faire des requêtes HTTP
- Retourne une Promise
- Remplace l'ancienne méthode XMLHttpRequest

**c) Template Literals**
```javascript
`${BASE_WEATHER}?q=${city}&units=${currentUnit}&appid=${API_KEY}`
```
- Utilise les backticks (`)
- Permet d'insérer des variables avec `${}`
- Construit l'URL de l'API dynamiquement

**d) encodeURIComponent()**
```javascript
encodeURIComponent(city)
```
- Encode les caractères spéciaux pour URL
- Exemple : "New York" devient "New%20York"
- Évite les erreurs dans les URLs

**e) Try/Catch - Gestion d'erreurs**
```javascript
try {
  // Code qui peut générer une erreur
  const data = await fetch(url);
} catch (error) {
  // Code exécuté en cas d'erreur
  console.error('Error:', error);
}
```
- `try` : Bloc de code à surveiller
- `catch` : Capture et gère les erreurs
- Évite que l'application plante

**f) JSON Parsing**
```javascript
const weather = await weatherRes.json();
```
- `.json()` : Méthode qui parse la réponse JSON
- Convertit la chaîne JSON en objet JavaScript
- Aussi asynchrone, nécessite `await`

**2. Fonction fetchWeatherByCoords() - Recherche par coordonnées GPS**
```javascript
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
```
**Explication** :
- Similaire à `fetchWeather()` mais utilise latitude et longitude
- Paramètres d'URL différents : `lat` et `lon` au lieu de `q`

#### 3.5 Géolocalisation

**Fonction getUserLocation()**
```javascript
function getUserLocation() {
  if (!navigator.geolocation) {
    document.getElementById('errorMessage').textContent = 
      'La géolocalisation n\'est pas supportée par votre navigateur.';
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
      let errorMessage = 'Impossible d\'obtenir votre position.';
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Vous avez refusé l\'accès à votre position.';
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
```

**Concepts expliqués** :

**a) Geolocation API**
```javascript
navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options)
```
- API JavaScript native du navigateur
- **Requiert HTTPS** pour fonctionner
- Demande la permission à l'utilisateur

**b) Callbacks (Fonctions de rappel)**
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => { /* succès */ },
  (error) => { /* erreur */ }
)
```
- Fonctions passées en paramètres
- Exécutées selon le résultat de l'opération
- `successCallback` : appelé si la position est obtenue
- `errorCallback` : appelé en cas d'échec

**c) Arrow Functions (Fonctions fléchées)**
```javascript
(position) => {
  const lat = position.coords.latitude;
}
```
- Syntaxe moderne ES6
- Plus concise que `function(position) {}`
- Garde le contexte `this`

**d) Switch Statement**
```javascript
switch(error.code) {
  case error.PERMISSION_DENIED:
    errorMessage = 'Refusé';
    break;
  case error.POSITION_UNAVAILABLE:
    errorMessage = 'Indisponible';
    break;
}
```
- Structure de contrôle pour tester plusieurs valeurs
- Plus lisible que plusieurs `if/else`
- `break` : sort du switch

**e) Objet Options**
```javascript
{
  enableHighAccuracy: true,  // Précision maximale
  timeout: 10000,            // Timeout de 10 secondes
  maximumAge: 0              // Pas de cache
}
```

#### 3.6 Mise à Jour de l'Interface

**Fonction updateUI()**
```javascript
function updateUI(weather, forecast) {
  // Mise à jour des informations principales
  document.getElementById('locationName').textContent = `${weather.name}, ${weather.sys.country}`;
  document.getElementById('currentDate').textContent = formatDate(weather.dt, weather.timezone);
  document.getElementById('mainIcon').textContent = getWeatherIcon(weather.weather[0].id);
  document.getElementById('mainTemp').textContent = formatTemp(weather.main.temp);
  document.getElementById('feelsLike').textContent = formatTemp(weather.main.feels_like);
  document.getElementById('humidity').textContent = `${weather.main.humidity}%`;
  document.getElementById('wind').textContent = formatWind(weather.wind.speed);
  
  // Précipitations
  const precip = weather.rain?.['1h'] || weather.snow?.['1h'] || 0;
  const precipValue = currentPrecipUnit === 'mm' ? precip.toFixed(1) : (precip / 25.4).toFixed(2);
  document.getElementById('precipitation').textContent = `${precipValue} ${currentPrecipUnit}`;

  // Mise à jour des prévisions horaires
  if (forecast) {
    const daySelector = document.getElementById('daySelector');
    const hourlyList = document.getElementById('hourlyList');
    
    // Grouper par jour
    const dailyDataMap = {};
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();
      if (!dailyDataMap[dayKey]) {
        dailyDataMap[dayKey] = [];
      }
      dailyDataMap[dayKey].push(item);
    });

    // Créer le sélecteur de jours
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

    // Fonction pour afficher les heures d'un jour
    function updateHourlyForecast(dayIndex) {
      hourlyList.innerHTML = '';
      const selectedDay = uniqueDays[dayIndex];
      const dayItems = dailyDataMap[selectedDay];
      
      dayItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'hourly-item';
        div.innerHTML = `
          <div class="hourly-time">
            <span>${getWeatherIcon(item.weather[0].id)}</span>
            <span>${formatTime(item.dt)}</span>
          </div>
          <div class="hourly-temp">${formatTemp(item.main.temp)}</div>
        `;
        hourlyList.appendChild(div);
      });
    }

    updateHourlyForecast(0);

    // Événement changement de jour
    daySelector.addEventListener('change', (e) => {
      updateHourlyForecast(parseInt(e.target.value));
    });

    // Prévisions quotidiennes (7 jours)
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
```

**Concepts expliqués** :

**a) Manipulation DOM**
```javascript
document.getElementById('locationName').textContent = `${weather.name}`;
```
- `.textContent` : Modifie le texte d'un élément
- Plus sûr que `.innerHTML` (pas d'injection de code)

**b) Optional Chaining (?.)** 
```javascript
const precip = weather.rain?.['1h'] || 0;
```
- Opérateur ES2020
- Évite les erreurs si `weather.rain` est undefined
- Retourne undefined au lieu de crash

**c) Nullish Coalescing (||)**
```javascript
const value = weather.rain?.['1h'] || 0;
```
- Si la valeur de gauche est falsy (null, undefined, 0, false, ''), utilise la valeur de droite
- Ici : si pas de pluie, utilise 0

**d) forEach() - Itération de tableau**
```javascript
forecast.list.forEach(item => {
  // Traitement de chaque item
});
```
- Méthode de Array
- Exécute une fonction pour chaque élément
- Alternative moderne à `for` loop

**e) createElement() et appendChild()**
```javascript
const div = document.createElement('div');
div.className = 'hourly-item';
div.innerHTML = '<span>Contenu</span>';
hourlyList.appendChild(div);
```
- `createElement()` : Crée un nouvel élément HTML
- `className` : Définit les classes CSS
- `innerHTML` : Définit le contenu HTML interne
- `appendChild()` : Ajoute l'élément au DOM

**f) Spread Operator (...)**
```javascript
const maxTemp = Math.max(...day.temps);
```
- Opérateur ES6
- "Étale" un tableau en arguments individuels
- `Math.max(...[1,2,3])` équivaut à `Math.max(1,2,3)`

**g) Object.keys() et Object.values()**
```javascript
const uniqueDays = Object.keys(dailyDataMap);
Object.values(dailyData).forEach(day => {});
```
- `Object.keys()` : Retourne un tableau des clés d'un objet
- `Object.values()` : Retourne un tableau des valeurs d'un objet

**h) Array.slice()**
```javascript
uniqueDays.slice(1)  // Du 2ème élément à la fin
dailyData.slice(0, 7)  // Les 7 premiers éléments
```
- Crée un nouveau tableau à partir d'une portion
- `slice(début, fin)`
- Ne modifie pas le tableau original

#### 3.7 Événements (Event Listeners)

**1. Recherche de ville**
```javascript
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
```

**Concepts** :
- `addEventListener('événement', fonction)` : Écoute un événement
- `click` : Clic de souris
- `keypress` : Touche appuyée
- `e.key` : Identifie la touche appuyée
- `.trim()` : Supprime les espaces au début et à la fin

**2. Géolocalisation**
```javascript
if (locationBtn) {
  locationBtn.addEventListener('click', getUserLocation);
}
```

**3. Changement d'unités**
```javascript
document.querySelectorAll('.units-option').forEach(option => {
  option.addEventListener('click', () => {
    const type = option.getAttribute('data-type');
    const value = option.getAttribute('data-value');
    
    if (type === 'temp') {
      currentUnit = value;
      document.querySelectorAll('[data-type="temp"] .checkmark')
        .forEach(c => c.style.display = 'none');
      option.querySelector('.checkmark').style.display = 'inline';
      
      if (lastCoords) {
        fetchWeatherByCoords(lastCoords.lat, lastCoords.lon);
      } else {
        fetchWeather(lastCity);
      }
    }
  });
});
```

**Concepts** :
- `querySelectorAll()` : Sélectionne tous les éléments correspondants
- `getAttribute()` : Récupère un attribut HTML personnalisé (`data-*`)
- Recharge les données avec la nouvelle unité

**4. Réessayer en cas d'erreur**
```javascript
retryBtn.addEventListener('click', () => {
  fetchWeather(lastCity);
});
```

---

## 🔄 Flux de l'Application

### Scénario 1 : Recherche par ville

```
1. Utilisateur entre "Paris" dans le champ de recherche
2. Utilisateur clique sur "Rechercher" ou appuie sur Entrée
3. addEventListener détecte l'événement
4. fetchWeather('Paris') est appelé
5. showState('loading') affiche le spinner
6. fetch() envoie une requête à l'API OpenWeatherMap
7. API retourne les données JSON
8. weatherRes.json() parse les données
9. Deuxième fetch() pour les prévisions
10. updateUI() met à jour tous les éléments HTML
11. showState('content') affiche les résultats
```

### Scénario 2 : Géolocalisation

```
1. Utilisateur clique sur le bouton 📍
2. getUserLocation() est appelé
3. navigator.geolocation.getCurrentPosition() demande la permission
4. Navigateur affiche popup de permission
5. Utilisateur accepte
6. successCallback reçoit les coordonnées (lat, lon)
7. fetchWeatherByCoords(lat, lon) est appelé
8. fetch() envoie une requête avec les coordonnées
9. API retourne les données de la ville correspondante
10. updateUI() affiche les résultats
```

### Scénario 3 : Changement d'unités

```
1. Utilisateur clique sur "Unités"
2. Menu déroulant s'affiche
3. Utilisateur sélectionne "Fahrenheit"
4. currentUnit = 'imperial'
5. Recharge les données avec fetchWeather() ou fetchWeatherByCoords()
6. API retourne les données en Fahrenheit
7. updateUI() affiche les nouvelles valeurs
```

---

## 📊 Structure des Données API

### Réponse Current Weather
```json
{
  "name": "Douala",
  "sys": {
    "country": "CM"
  },
  "coord": {
    "lat": 4.05,
    "lon": 9.7
  },
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "clear sky"
    }
  ],
  "main": {
    "temp": 28.5,
    "feels_like": 31.2,
    "humidity": 75
  },
  "wind": {
    "speed": 3.5
  },
  "rain": {
    "1h": 0.5
  },
  "dt": 1698766800,
  "timezone": 3600
}
```

### Réponse Forecast
```json
{
  "list": [
    {
      "dt": 1698766800,
      "main": {
        "temp": 28.5,
        "feels_like": 31.2
      },
      "weather": [
        {
          "id": 800,
          "main": "Clear"
        }
      ]
    },
    // ... 39 autres entrées (prévisions toutes les 3h sur 5 jours)
  ]
}
```

---

## 🎨 Fonctionnalités Principales

### ✅ Fonctionnalités Implémentées

1. **Recherche de ville**
   - Saisie manuelle du nom de la ville
   - Validation et gestion d'erreurs

2. **Géolocalisation**
   - Détection automatique de la position
   - Requiert HTTPS et permission utilisateur

3. **Affichage météo actuelle**
   - Température actuelle et ressentie
   - Humidité, vent, précipitations
   - Icônes météo dynamiques

4. **Prévisions horaires**
   - Par tranches de 3 heures
   - Sélecteur de jour
   - Icônes et températures

5. **Prévisions quotidiennes**
   - 7 jours
   - Températures min/max
   - Icônes météo

6. **Conversion d'unités**
   - Température : Celsius/Fahrenheit
   - Vent : km/h / mph
   - Précipitations : mm / pouces

7. **États de l'application**
   - Chargement (spinner)
   - Erreur (messages personnalisés)
   - Contenu (données météo)

8. **Design responsive**
   - Adapté mobile et desktop
   - Grid et flexbox

---

## 🔐 Sécurité et Bonnes Pratiques

### Sécurité

1. **HTTPS Obligatoire**
   - Requis pour la géolocalisation
   - GitHub Pages fournit HTTPS gratuit

2. **Validation des entrées**
   - `encodeURIComponent()` pour les URLs
   - `.trim()` pour nettoyer les saisies

3. **Gestion des erreurs**
   - Try/Catch pour capturer les erreurs
   - Messages d'erreur clairs pour l'utilisateur

### Bonnes Pratiques JavaScript

1. **Const/Let au lieu de Var**
   - `const` pour les valeurs constantes
   - `let` pour les variables modifiables

2. **Arrow Functions**
   - Syntaxe moderne et concise

3. **Async/Await**
   - Plus lisible que les Promises

4. **Template Literals**
   - Meilleure lisibilité des chaînes

5. **Destructuring** (non utilisé mais recommandé)
   ```javascript
   const { temp, humidity } = weather.main;
   ```

---

## 🚀 Déploiement

### GitHub Pages

1. **Repository** : https://github.com/KLK2005/weather-app
2. **URL Publique** : https://klk2005.github.io/weather-app/
3. **Configuration** : Settings > Pages > Deploy from branch `main`

### Avantages GitHub Pages

- ✅ Hébergement gratuit
- ✅ HTTPS automatique
- ✅ Déploiement automatique à chaque push
- ✅ CDN global (rapide partout)

---

## 📈 Améliorations Possibles

### Fonctionnalités Supplémentaires

1. **Historique de recherche**
   - LocalStorage pour sauvegarder les villes recherchées

2. **Favoris**
   - Système de villes favorites

3. **Graphiques**
   - Chart.js pour visualiser les prévisions

4. **Multilingue**
   - Internationalisation (i18n)

5. **Mode sombre/clair**
   - Toggle pour changer le thème

6. **PWA (Progressive Web App)**
   - Fonctionnement hors ligne
   - Installation sur mobile

### Optimisations Techniques

1. **Debouncing pour la recherche**
   - Limiter les appels API pendant la saisie

2. **Cache des résultats**
   - Éviter les appels API répétés

3. **Lazy Loading**
   - Charger les images à la demande

4. **Minification**
   - Réduire la taille des fichiers CSS/JS

---

## 🎓 Concepts Clés pour l'Exposé

### Pour les Débutants

1. **HTML** = Structure (squelette de la maison)
2. **CSS** = Style (décoration de la maison)
3. **JavaScript** = Comportement (électricité, plomberie)

### Pour les Intermédiaires

1. **API REST** = Communication client-serveur
2. **JSON** = Format d'échange de données
3. **Async/Await** = Gestion de l'asynchrone
4. **DOM Manipulation** = Modification dynamique de la page

### Pour les Avancés

1. **Event Loop** = Gestion de l'asynchrone en JavaScript
2. **Promises** = Opérations asynchrones
3. **Geolocation API** = API native du navigateur
4. **Responsive Design** = Grid, Flexbox, Media Queries

---

## 📝 Glossaire

- **API** : Interface de Programmation d'Application - Permet la communication entre applications
- **Async** : Asynchrone - Opérations qui ne bloquent pas l'exécution
- **Callback** : Fonction de rappel - Fonction passée en paramètre
- **DOM** : Document Object Model - Représentation en mémoire de la page HTML
- **Fetch** : Méthode pour faire des requêtes HTTP
- **JSON** : JavaScript Object Notation - Format de données
- **Promise** : Objet représentant une opération asynchrone
- **REST** : Representational State Transfer - Architecture d'API
- **Responsive** : S'adapte à différentes tailles d'écran

---

## 🔗 Ressources

- **API OpenWeatherMap** : https://openweathermap.org/api
- **MDN Web Docs** : https://developer.mozilla.org/
- **GitHub Pages** : https://pages.github.com/
- **Repository du projet** : https://github.com/KLK2005/weather-app

---

**Auteur** : KLK2005  
**Date** : Octobre 2026  
**Version** : 1.0
