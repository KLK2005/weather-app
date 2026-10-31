# 🌤️ Application Météo

Une application météo moderne et responsive qui affiche les conditions météorologiques actuelles et les prévisions pour n'importe quelle ville dans le monde.

## ✨ Fonctionnalités

- 🔍 Recherche de météo par ville
- 🌡️ Affichage de la température actuelle, ressenti, humidité, vent et précipitations
- 📅 Prévisions quotidiennes sur 7 jours
- ⏰ Prévisions horaires
- 🔄 Conversion d'unités (Celsius/Fahrenheit, km/h/mph, mm/in)
- 📱 Design responsive (mobile et desktop)
- 🎨 Interface moderne avec animations

## 🚀 Démo en ligne

🔗 [Voir la démo](https://votre-username.github.io/weather)

## 🛠️ Technologies utilisées

- HTML5
- CSS3 (avec variables CSS et animations)
- JavaScript (Vanilla)
- API OpenWeatherMap

## 📦 Installation locale

1. Clonez ce dépôt :
```bash
git clone https://github.com/votre-username/weather.git
cd weather
```

2. Ouvrez `index.html` dans votre navigateur

**Note:** Pour utiliser l'application en local sans serveur, vous aurez besoin d'une clé API OpenWeatherMap. La clé actuelle est incluse dans le code mais vous pouvez obtenir la vôtre gratuitement sur [OpenWeatherMap](https://openweathermap.org/api).

## 🌐 Déploiement sur GitHub Pages

Ce projet est configuré pour être déployé sur GitHub Pages avec HTTPS (requis pour la géolocalisation du navigateur).

### Étapes de déploiement :

1. Poussez votre code sur GitHub
2. Allez dans **Settings** > **Pages**
3. Sélectionnez la branche `main` comme source
4. Votre site sera disponible sur `https://votre-username.github.io/weather`

## 🔑 Configuration de l'API

L'application utilise l'API OpenWeatherMap. Pour utiliser votre propre clé API :

1. Créez un compte gratuit sur [OpenWeatherMap](https://openweathermap.org/api)
2. Obtenez votre clé API
3. Remplacez la clé dans `js/script.js` :
```javascript
const API_KEY = 'votre_clé_api_ici';
```

## 📱 Captures d'écran

Des captures d'écran du design sont disponibles dans le dossier `/design`.

## 📄 Licence

Ce projet est open source et disponible sous la [MIT License](LICENSE).

## 👤 Auteur

Créé avec ❤️ pour apprendre et partager.
