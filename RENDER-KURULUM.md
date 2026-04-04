# FocusNet — Render + Alan adı (focusnet.com)

## 1) Kodu GitHub’a yükle

1. [github.com](https://github.com)’da yeni bir **repository** oluştur (ör. `focusnet`).
2. Bilgisayarında `FocusNet` klasöründe:

```bash
git init
git add .
git commit -m "FocusNet"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/focusnet.git
git push -u origin main
```

(`.env` dosyası `.gitignore`’da; GitHub’a gitmez — doğru.)

## 2) Render’da Web Service

1. [render.com](https://render.com) → kayıt / giriş (GitHub ile bağla).
2. **New +** → **Blueprint** veya **Web Service**.
3. Repo’yu seç; **Root Directory** boş bırak (proje kökü `server.js` ise).
4. Ayarlar:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`

## 3) Ortam değişkenleri (Environment)

Render → servisin **Environment** sekmesi:

| Anahtar | Değer |
|--------|--------|
| `MONGODB_URI` | Atlas’taki tam bağlantı dizesi (`focusnet` veritabanı adı URL’de olsun). |
| `JWT_SECRET` | Uzun rastgele gizli anahtar (ör. PowerShell: `[Convert]::ToBase64String((1..32|%{Get-Random -Max 256})|%{[byte]$_})`). |

**MongoDB Atlas:** Network Access → **0.0.0.0/0** (veya Render çıkış IP’leri) izinli olsun.

Deploy bitince adres: `https://focusnet-xxxx.onrender.com` gibi olur.

## 4) Kendi alan adın: focusnet.com

`focusnet.com` **Render’da ücretsiz verilmez**; bir **domain satıcısından** satın alırsın (Namecheap, Cloudflare, Google Domains, Natro vb.).

1. Render → servis → **Settings** → **Custom Domains** → **Add** → `focusnet.com` ve isteğe bağlı `www.focusnet.com`.
2. Render sana **DNS kayıtlarını** gösterir (genelde **CNAME** `www` → `xxx.onrender.com`, kök için **A** veya CNAME alias — Render’ın güncel talimatını kopyala).
3. Domain panelinde bu kayıtları ekle; yayılması **birkaç dakika–48 saat** sürebilir.
4. Render’da **Verify** ile doğrula; HTTPS genelde otomatik gelir.

## 5) Ücretsiz plan notu

Render **Free** web servisleri bir süre kullanılmayınca uyur; ilk istekte **10–60 sn** gecikme olabilir. Sürekli açık ve hız için ücretli plan gerekir.

## Sorun giderme

- **Deploy failed:** Build log’da `npm install` hatası var mı bak.
- **Application failed to respond:** `MONGODB_URI` veya Atlas IP kısıtı; Render loglarına bak.
- **Açılıyor ama API hata veriyor:** `JWT_SECRET` Render’da tanımlı mı kontrol et.
