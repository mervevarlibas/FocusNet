# Render + Mobil (her yerde çalışır)

## Özet

| Ne | Adres |
|----|--------|
| **Canlı API + Web** | `https://focusnet.onrender.com` (Render panelindeki URL’yi kopyala) |
| **Mobil** | `mobile/.env` → aynı URL (`EXPO_PUBLIC_API_URL`) |
| **Veritabanı** | MongoDB Atlas (internetten erişilir) |
| **CI/CD** | GitHub Actions (`.github/workflows/ci.yml`) — Jenkins değil |

Okulda veya evde **sadece internet** yeterli; PC’de `npm run api` şart değil.

---

## 1. Render’da API’yi ayakta tut

1. [render.com](https://render.com) → giriş → **New +** → **Web Service**
2. GitHub repo **FocusNet** bağla
3. Ayarlar:
   - **Build:** `npm ci`
   - **Start:** `npm start`
   - **Health check path:** `/api/health`
4. **Environment** (Settings → Environment):

| Key | Değer |
|-----|--------|
| `MONGODB_URI` | Atlas bağlantı — **mutlaka** `/focusnet` olsun (ör. `...mongodb.net/focusnet?retryWrites=true&w=majority`). **YANLIŞ:** `...mongodb.net/?appName=...` (kayıtlar `test` DB’ye gider) |
| `JWT_SECRET` | Uzun rastgele metin (her yerde aynı kalsın) |
| `REDIS_DISABLED` | `1` (ücretsiz planda Redis zorunlu değil) |

5. **Deploy** → bitince üstteki URL’yi kopyala (ör. `https://focusnet.onrender.com`)

6. Tarayıcıda test: `https://SENIN-URL.onrender.com/api/health`  
   → `{"ok":true,"mongo":true,"database":"focusnet","usersCount":3,...}`

**Atlas'ta kullanıcı göremiyorsan:** Mobil `focusnet.onrender.com` kullanıyorsa Atlas'ta **Render'ın bağlandığı** cluster + **`focusnet` veritabanı** + **`users` koleksiyonu**na bak (`test` değil). Health'teki `usersCount` artıyorsa kayıt çalışıyordur.

**Atlas:** Network Access → `0.0.0.0/0` (Render sunucusu bağlanabilsin).

**Ücretsiz plan:** 15 dk kullanılmazsa uyur; ilk istek 30–60 sn sürebilir — mobilde bir kez bekleyip tekrar giriş yap.

---

## 2. Mobil uygulama (Expo Go)

`mobile/.env`:

```env
EXPO_PUBLIC_API_URL=https://focusnet.onrender.com
```

Render panelindeki URL farklıysa (ör. `focusnet-api.onrender.com`) **onu yaz**.

```powershell
cd mobile
npx expo start -c
```

Telefon: **Expo Go** → QR. **Okul Wi‑Fi yeterli** — ev IP’si gerekmez.

`.env` değiştirdikten sonra mutlaka `expo start -c` (cache temiz).

---

## 3. Jenkins nedir? Bizde ne var?

| Araç | Ne işe yarar |
|------|----------------|
| **Jenkins** | Ayrı bir sunucuda kurulan CI/CD; okulda genelde IT kurar |
| **GitHub Actions** | Repodaki `.github/workflows/ci.yml` — push olunca otomatik test |

**Sizin proje:** GitHub’a push → **Actions** sekmesinde `api` + `mobile` job’ları yeşil tik = CI/CD kanıtı.

Hoca “Jenkins” dediyse: “CI/CD için GitHub Actions kullanıyoruz; Jenkins aynı işin kurumsal sürümü” dene. İsterseniz okul Jenkins’ine aynı komutları (`npm ci`, `node --check server.js`, `npx tsc`) ekletirsiniz.

---

## 4. Hocaya kanıt sırası (kısa)

1. Tarayıcı: `https://...onrender.com/api/health` → `ok: true`
2. GitHub → **Actions** → son workflow yeşil
3. Telefon: Expo Go → giriş → ana sayfa (Render API)
4. (İsteğe) Atlas → `users` koleksiyonu

---

## 5. Yerel geliştirme (isteğe bağlı)

Evde kendi PC API’si:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.125:3000
```

+ `npm run api` (aynı Wi‑Fi). Canlı sunucu için bu satırı **yorum yap**, Render URL’sini kullan.

---

## Sorun giderme

| Belirti | Çözüm |
|---------|--------|
| Timeout / sunucuya ulaşılamadı | Render deploy OK mi? Health URL açılıyor mu? 1 dk bekle (uyku) |
| 401 / giriş yok | Atlas + `JWT_SECRET` Render’da doğru mu |
| Mobil hâlâ ev IP’si | `mobile/.env` Render URL + `expo start -c` |
| Render 404 | Dashboard’daki gerçek URL’yi `mobile/.env` ve `PRODUCTION_API_URL` ile eşle |
