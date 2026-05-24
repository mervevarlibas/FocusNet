# FocusNet

Ders çalışma ve sosyal motivasyon platformu — günlük hedef, kronometre, Pomodoro, takvim, liderlik tablosu ve arkadaş sistemi.

**Ekip:** COREX — Merve Varlıbaş, Dilan Alma

## Proje linkleri

| | |
|---|---|
| REST API | _(canlı adresinizi buraya yazın)_ |
| Web | _(canlı adresinizi buraya yazın)_ |
| Mobil | Expo Go — `mobile/` klasörü |

## Klasör yapısı

```
FocusNet/
├── server.js          # REST API (Node.js + Express + MongoDB)
├── public/            # Web arayüzü
├── mobile/            # React Native (Expo) mobil uygulama
├── docker-compose.yml # Yerel API + MongoDB
└── render.yaml        # Render deploy şablonu
```

## Hızlı başlangıç (API)

```bash
npm install
cp .env.example .env   # MONGODB_URI ve JWT_SECRET doldur
npm start
```

Sağlık kontrolü: `GET /api/health`

Docker ile:

```bash
docker compose up -d
```

## Mobil uygulama

```bash
cd mobile
npm install
cp .env.example .env   # EXPO_PUBLIC_API_URL
npx expo start
```

Expo Go (SDK 54) ile QR kodu okutun. Telefonda test için API adresinde bilgisayarın yerel IP’si gerekir (`localhost` çalışmaz).

## Dokümantasyon

1. [Gereksinim Analizi](Gereksinim-Analizi.md)
2. [REST API Tasarımı](API-Tasarimi.md)
3. [REST API](Rest-API.md)
4. [Web Front-End](Web-Frontend.md)
5. [Mobil Front-End](MobilFrontEnd.md)
6. [Mobil Backend](MobilBackEnd.md)
