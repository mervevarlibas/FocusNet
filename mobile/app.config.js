/** @type {import('expo/config').ExpoConfig} */
const appJson = require('./app.json');

// Okul / ev / her Wi‑Fi: Render’daki canlı API (mobile/.env ile değiştirilebilir)
const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'https://focusnet.onrender.com';

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      apiUrl: API_URL,
    },
  },
};
