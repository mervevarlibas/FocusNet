# Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [FocusNet](https://focusnet.onrender.com/)

---

## Grup Üyelerinin Web Frontend Görevleri

1. [Merve Varlıbaş'ın Web Frontend Görevleri](Merve-Varlıbaş/Merve-Varlıbaş-Web-Frontend-Gorevleri.md)
2. [Dilan Alma'nın Web Frontend Görevleri](Dilan-Alma/Dilan-Alma-Web-Frontend-Gorevleri.md)

---

## Genel Web Frontend Prensipleri

## 1. Responsive tasarım

| İlke | FocusNet’te durum |
|------|-------------------|
| *Mobile-first* | Temel düzen küçük ekrandan büyüyecek şekilde esnek; üst çubuk ve navigasyon mobilde sarılabilir / dikey hizalanır. |
| *Breakpoints* | *Mobil:* &lt; 768px · *Tablet:* 768px–1024px · *Masaüstü:* &gt; 1024px — style.css içinde bu aralıklar için medya sorguları kullanılır. |
| *Grid / Flexbox* | Üst bar, paneller, takvim ızgarası, avatar seçici: *Flexbox* ve *CSS Grid*. |
| *Responsive görseller* | Şu an çoğunlukla CSS gradient / metin; ileride fotoğraf eklenirse srcset ve sizes kullanılmalı. |
| *Dokunma hedefi* | Önemli butonlarda hedef boyutu *en az ~44×44 px* (WCAG önerisi) — navigasyon ve ikon düğmeleri buna göre ayarlanır. |

---

## 2. Tasarım sistemi

| İlke | FocusNet’te durum |
|------|-------------------|
| *CSS framework* | Harici framework yok; *özel (custom)* stil — daha hafif ve proje renklerine tam uyum. |
| *Renk paleti* | :root ve body.theme-light içinde *CSS değişkenleri* (lacivert, camgöbeği, neon vurgular). |
| *Tipografi* | *Google Fonts:* Outfit (arayüz), JetBrains Mono (sayıcılar); yedek: system-ui. |
| *Spacing* | *8px tabanı* — rem ile tutarlı boşluklar (--space-* değişkenleri ile genişletilebilir). |
| *İkonografi* | Şimdilik Unicode sembolleri; ileride *Heroicons* / *Material Symbols* (SVG veya font) eklenebilir. |
| *Bileşenler* | Kart, buton, cam (glass) panel, formlar — *yeniden kullanılabilir sınıflar* (card, btn-primary, glass). |

---

## 3. Performans optimizasyonu

| İlke | FocusNet’te durum |
|------|-------------------|
| *Code splitting* | Tek sayfa, tek app.js; framework yok → klasik anlamda route split yok. İleride modüler import() ile parçalanabilir. |
| *Lazy loading* | Görseller eklendiğinde loading="lazy"; ağır bölümler için dinamik yükleme düşünülebilir. |
| *Minification* | Geliştirme ham dosya; *production* için build adımında CSS/JS sıkıştırma veya hosting’in sunduğu sıkıştırma kullanılabilir. |
| *Sıkıştırma* | *Render* vb. genelde *gzip/brotli* ile yanıt verir; ek ayar hosting dokümantasyonundan. |
| *Önbellekleme* | Statik dosyalar için uzun süreli Cache-Control (sunucu veya CDN ayarı); *PWA / service worker* isteğe bağlı ileri adım. |
| *Bundle boyutu* | Harici framework olmadığı için başlangıç yükü düşük; yeni kütüphane eklerken boyut bilinçli seçilmeli. |

---

## 4. SEO (Arama motoru optimizasyonu)

| İlke | FocusNet’te durum |
|------|-------------------|
| *Meta etiketleri* | title, description, keywords, theme-color, viewport — index.html içinde. |
| *Yapılandırılmış veri* | *JSON-LD* (WebApplication / SoftwareApplication) — arama motorlarına uygulama özeti. |
| *Semantik HTML* | header, nav, main, section, footer kullanımı. |
| *Alt metin* | İleride <img> eklenirse anlamlı alt zorunlu. |
| *Sitemap / robots* | Genel arama için *XML sitemap* ve *robots.txt* sunucudan servis edilebilir (ileri aşama). |

---

## 5. Erişilebilirlik (Accessibility)

| İlke | FocusNet’te durum |
|------|-------------------|
| *WCAG 2.1 AA hedefi* | Kontrast ve odak stilleri iyileştirilmeye uygun; kritik metinler okunabilir tutulur. |
| *Klavye* | Tüm etkileşimli öğeler *Tab* ile erişilebilir; görünür *:focus-visible* halkası. |
| *Ekran okuyucu* | nav ve önemli bölgeler için *aria-label*; mümkün olduğunca anlamlı düğme metinleri. |
| *Kontrast* | Açık/koyu temada metin–arka plan çiftleri kontrol edilir (hedef ~4.5:1 gövde metni). |
| *Skip link* | “İçeriğe atla” bağlantısı — main bölümüne hızlı geçiş. |

---

## 6. Tarayıcı uyumluluğu

| İlke | FocusNet’te durum |
|------|-------------------|
| *Hedef* | Chrome, Firefox, Safari, Edge — *son 2 sürüm* (modern tarayıcı). |
| *Polyfill* | ES6+ kullanımı sınırlı; gerekirse *core-js* veya özellik bazlı polyfill. |
| *CSS önekleri* | Gerekirse build’de *Autoprefixer*; şu an kritik özellikler çoğunlukla evrensel. |
| *Özellik algılama* | İleri özellikler için if ('serviceWorker' in navigator) gibi *native* kontroller. |

---

## 7. State (durum) yönetimi

| İlke | FocusNet’te durum |
|------|-------------------|
| *Global durum* | *Vanilla JS* modülü: token, zamanlayıcı bayrakları, takvim ayı — tek app.js içinde; Redux/Vuex yok. |
| *Yerel durum* | Formlar ve görünümler DOM ile güncellenir. |
| *Sunucu durumu* | *Fetch API* ile /api/*; oturum **JWT** + localStorage. |
| *Form durumu* | Basit formlar — ileride büyürse doğrulama için hafif bir kütüphane düşünülebilir. |

---

## 8. Routing (yönlendirme)

| İlke | FocusNet’te durum |
|------|-------------------|
| *İstemci tarafı* | *Tek sayfa (SPA) hissi:* section.view göster/gizle; React Router eşdeğeri yok. |
| *Derin bağlantı* | Şu an URL panelleri ayırmıyor; ileride history.pushState veya basit hash (#/pomodoro) ile *paylaşılabilir link* eklenebilir. |
| *Korumalı sayfalar* | Token yoksa giriş ekranı; API tarafında *JWT doğrulama*. |
| *404* | Express’te tanımsız API yolları için JSON hata; statik SPA için app.get('*') index.html döner — özel 404 sayfası isteğe bağlı. |

---

## 9. API entegrasyonu

| İlke | FocusNet’te durum |
|------|-------------------|
| *HTTP istemcisi* | *fetch* (Axios yerine yerleşik API). |
| *İstekler* | Authorization: Bearer <token> başlığı authHeaders() ile. |
| *Hata yönetimi* | try/catch + alert / mesaj alanları; merkezi bir hata katmanı ileride toplanabilir. |
| *Yükleme durumu* | İleride global “yükleniyor” göstergesi eklenebilir. |

---

## 10. Test

| İlke | FocusNet’te durum |
|------|-------------------|
| *Birim test* | Henüz yok; API için *Jest* / *Node test* eklenebilir. |
| *Entegrasyon / E2E* | *Playwright* veya *Cypress* ile kritik akışlar (kayıt, giriş, hedef). |
| *Erişilebilirlik* | *axe-core, **Lighthouse* Accessibility skoru ile periyodik kontrol. |

---

## 11. Build ve deployment

| İlke | FocusNet’te durum |
|------|-------------------|
| *Build aracı* | Şu an *doğrudan Node; istenirse **Vite* sadece frontend paketlemek için eklenebilir. |
| *Ortam değişkenleri* | Sunucu: .env (MONGODB_URI, JWT_SECRET, PORT); *Render* panelinde aynı anahtarlar. |
| *CI/CD* | *GitHub Actions* ile lint/test/deploy otomasyonu isteğe bağlı. |
| *Hosting* | *Render* (bkz. RENDER-KURULUM.md); alternatif: Railway, VPS. |
