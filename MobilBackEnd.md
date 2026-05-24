# Mobil Backend (REST API Bağlantısı) Görev Dağılımı

**REST API Adresi:** [api.yazmuh.com](https://api.yazmuh.com)

---
## Grup Üyelerinin Mobil Backend Görevleri

1. [Merve Varlıbaş'ın Mobil Backend Görevleri](Merve-Varlıbaş/Merve-Varlıbaş-Mobil-Backend-Görevleri.md)
2. [Grup Üyesi 2'nin Mobil Backend Görevleri](Dilan-Alma/Dilan-Alma-Mobil-Backend-Gorevleri.md)

## Genel Mobil Backend Prensipleri

### 1. HTTP Client Yapılandırması
- **Base URL:** `https://api.yazmuh.com/v1`
- **Timeout:** Request timeout 30 saniye, connect timeout 10 saniye
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}` (Giriş ve kayıt hariç tüm endpoint'lerde zorunludur).
- **Veri Formatlama:** 
  -Milisaniye cinsinden tutulan kronometre süreleri API'ye gönderilmeden önce dakikaya çevrilmeli, tarihler YYYY-MM-DD (ISO) formatında iletilmelidir.

### 2. Authentication Yönetimi
- Başarılı giriş sonrası dönen JWT token'ın cihazın güvenli hafızasında (Keystore / Keychain / EncryptedSharedPreferences) saklanması.
- Token süresi dolduğunda (Token Expired) sessizce yenileme (Refresh Token) mekanizmasının çalıştırılması.
- API'den 401 Unauthorized yanıtı alınırsa kullanıcının oturumunun otomatik kapatılarak giriş (Login) ekranına yönlendirilmesi.
- Logout veya "Hesabı Sil" durumlarında yerel token'ın ve önbelleğin (cache) tamamen temizlenmesi.

### 3. Error Handling
- Spesifik Hata Kodları: - 409 Conflict: Kayıt olurken veya arkadaş eklerken e-posta zaten varsa.
404 Not Found: Arkadaş eklemede kullanıcı bulunamazsa.
400 Bad Request: Form validasyonları sunucu tarafında başarısız olursa.
- Network hataları (timeout, internet yok bağlantısı) durumunda kullanıcıya anlaşılır mesajlar (Örn: "Bağlantı koptu, lütfen tekrar deneyin") gösterilmesi.
- Kronometre ve Pomodoro bitiminde internet yoksa, sürenin cihazda bekletilip (Offline Queue) bağlantı geldiğinde API'ye POST /api/study/log isteği olarak tekrar denenmesi (Retry mekanizması).

### 4. Caching Stratejisi
- GET /api/leaderboard, GET /api/calendar ve GET /api/me gibi sık çağrılan veriler için response caching uygulanması (veritabanı ve ağ yükünü azaltmak için).
- Kullanıcı avatarını, temasını veya günlük hedefini güncellediğinde (PUT /api/me, POST /api/goals), ilgili verilerin cache'inin (Cache Invalidation) temizlenip güncel verinin çekilmesi.
- Offline-first (Önce çevrimdışı) yaklaşımı ile, internet yokken kullanıcının geçmiş takvimini ve liderlik tablosunu son halinden okuyabilmesi.

### 5. Loading States & Optimistic Updates
- API istekleri başlarken (Örn: Giriş yapma, liste çekme) kullanıcı arayüzünde asenkron loading (Skeleton veya Spinner) gösterilmesi.
- Optimistic Updates: Hedef güncellendiğinde, arkadaş eklendiğinde veya tema değiştirildiğinde, API'den başarılı yanıt (200 OK) beklenmeden ekranın anında güncellenmesi, istek başarısız olursa (catch) eski haline geri döndürülerek hatanın gösterilmesi.

### 6. Logging ve Debugging
- Geliştirme (Development) aşamasında HTTP isteklerini ve dönen JSON yanıtlarını konsolda görmek için Network Interceptor (Örn: OkHttp Logging Interceptor veya Alamofire Logger) kullanımı.
- Final sürümünde (Production) hata kayıtları (Error logging) dışında güvenlik amacıyla token ve şifrelerin loglanmasının devre dışı bırakılması.