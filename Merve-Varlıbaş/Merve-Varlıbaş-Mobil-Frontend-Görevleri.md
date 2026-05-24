# Merve Varlıbaş'ın Mobil Frontend Görevleri
**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

## 1.Günlük Hedef ve Yüzde Tamamlama Ekranı
- **API Endpoint:** `POST /api/goals, GET /api/me, DELETE /api/goals/{date}`
- **Görev:** Kullanıcının günlük çalışma hedefini belirlemesi, güncellemesi ve hedefin gerçekleşme oranını görselleştirmesi için mobil UI tasarımı ve implementasyonu.
- **UI Bileşenleri:**
  - Progress Ring (İlerlemeyi gösteren dairesel grafik bileşeni)
  - Tamamlanan ve hedef dakika göstergesi (Örn: 45 / 120 dk, büyük tipografi)
  - "Saat" ve "Dakika" girişleri için input alanları (keyboard type: number)
  - "Hedef Oluştur / Güncelle" butonu
- **Form Validasyonu:**
  - Saat ve dakika alanlarına sadece rakam girilebilmesi
  - Boş bırakılan alanlarda kaydet butonunun disabled olması
  - **Kullanıcı Deneyimi:**
  - Hedef silme işleminde destructive action uyarı dialog'u ("Hedefi silmek istediğinize emin misiniz?")
  -Veri yüklenirken loading skeleton gösterimi
  - **Teknik Detaylar:**
  - Platform: Android (Jetpack Compose/Canvas) veya iOS (SwiftUI/Path) ile özel çizim (Custom Painter)
  - API'den gelen ilerleme yüzdesinin arayüze gerçek zamanlı entegrasyonu

 ## 2.Serbest Süre Takibi(Stopwatch) Ekranı
 - **API Endpoint:** `POST /api/study/log`
- **Görev:** Kullanıcının plansız (serbest) çalışma sürelerini takip etmesi ve mobilde kaydedebilmesi için arayüz implementasyonu.
- **UI Bileşenleri:**
  - "Başlat" butonu (primary button)
  - "Durdur & Kaydet" butonu (secondary/outline button)
  - HH:MM:SS formatında dinamik dijital zamanlayıcı metni (Monospace font)
  - **Kullanıcı Deneyimi:**
  - Zamanlayıcı başlatıldığında "Başlat" butonunun disabled state'e geçmesi
  - Süre durdurulduğunda sayacın sıfırlanması ve arayüzün "00:00:00" durumuna dönmesi
  - **Teknik Detaylar:**
  - Milisaniye cinsinden hesaplanan sürenin API'ye gönderilmeden önce dakikaya çevrilmesi (Math calculation)
  - App arka plana (background) alındığında yaşam döngüsü (Lifecycle) yönetimi ile sürenin doğru hesaplanmaya devam etmesi

  ## 3.Pomodoro Zamanlayıcı Ekranı
  - **API Endpoint:** `POST /api/study/log`
- **Görev:** Klasik Pomodoro tekniği (25 dk çalışma, 5 dk mola) akışının mobil arayüz tasarımı ve implementasyonu.
- **UI Bileşenleri:**
  - Mevcut faz göstergesi ("Çalışma" veya "Mola" etiketleri)
  - MM:SS formatında büyük geri sayım sayacı
  - "Başlat" (Play ikonu), "Duraklat" (Pause ikonu) ve "Bitir" (Stop ikonu) butonları
- **Kullanıcı Deneyimi:**
  - 25 dakikalık çalışma periyodu bittiğinde otomatik olarak 5 dakikalık "Mola" fazına geçiş
  - Duraklatılan sürenin tekrar kaldığı yerden devam ettirilebilmesi
  - **Teknik Detaylar:**
  - CountDownTimer entegrasyonu ve her saniye UI state güncellemesi
  - Cihaz donanımlarına erişim (Vibrator/Notification Manager)

  ## 4.Arkadaş Ekleme ve Silme Akışı
  - **API Endpoint:** `GET /api/friends, POST /api/friends, DELETE /api/friends/{id}`
- **Görev:** Platform içi sosyal etkileşimi sağlamak için arkadaş listesi ve yönetim ekranlarının implementasyonu.
- **UI Bileşenleri:**
  - Email input alanı (keyboard type: email, arkadaş aramak/eklemek için)
  - Liste elemanları: Avatar (initial harflerle renkli), Görünen Ad, Email
  - Form validasyon hataları için error text alanı
- **Form Validasyonu:**
  - Email format kontrolü
  - Kendi kendini eklemeyi engelleme
- **Kullanıcı Deneyimi:**
  - Arkadaş silme işlemi için liste elemanını sağa/sola kaydırma (Swipe-to-delete) veya uzun basarak Native onay penceresi çıkarma
  - Empty state (henüz arkadaş yoksa gösterilecek özel tasarım)
- **Teknik Detaylar:**
  - Yüksek performanslı liste render işlemi (Lazy loading)
  - Keyboard dismiss (eklendiği an klavyenin kapanması)

  ## 5 .Liderlik Tablosu ve Çalışma Serisi(Streak) Ekranı
  - **API Endpoint:** `GET /api/leaderboard, GET /api/me`
- **Görev:** Kullanıcı motivasyonunu artıracak Streak kartı ve Liderlik sıralamasının mobil arayüzde gösterimi.
- **UI Bileşenleri:**
  - Sıralama listesi (Kullanıcı adı, toplam süre, streak sayısı sütunları)
  - Pull-to-refresh (Aşağı çekerek yenile) mekanizması
  - Mevcut kullanıcının durumunu özetleyen sticky (sabit) alt bar ("Sıranız: #X · Toplam Y dk")
- **Kullanıcı Deneyimi:**
  - İsim verisi null gelirse fallback olarak email'in ilk kısmını gösterme
  -Kullanıcının kendi hesabının listede özel bir renk/arkaplan (highlight) ile vurgulanması
  - **Teknik Detaylar:**
  - Birden fazla API çağrısının asenkron yönetimi (Leaderboard listesi ve Me endpoint'i)
  - Scrollable view (kaydırılabilir liste) performansı yönetimi

  ## 6.Profil Özelleştirme ve Ekran Teması Sistemi
  - **API Endpoint:** `PUT /api/me`
- **Görev:** Tema (Koyu/Açık), ad ve avatar rengi gibi kişiselleştirme ayarlarının yapılacağı ekranın implementasyonu.
- **UI Bileşenleri:**
  - Tema Toggle (Switch bileşeni, ☾/☀ ikonları ile)
  - 8 farklı renge sahip Avatar seçici
  - "Kaydet" butonu
- **Form Validasyonu:**
  - Ad alanının boş bırakılmaması
  - Değişiklik yapılmadıysa kaydet butonunun disabled olması
  - **Kullanıcı Deneyimi:**
  - Tema anahtarına (Switch) basıldığında uygulamanın yeniden başlatılmasına gerek kalmadan anında Koyu/Açık temaya geçmesi (Optimistic update)
  -Kayıt başarılı olduğunda "Ayarlar Kaydedildi" snackbar bildirimi
  - **Teknik Detaylar:**
  - Tema bilgisinin yerel hafızaya (SharedPreferences/DataStore/UserDefaults) yazılarak oturumlar arası kalıcılığının (client-side persistence) sağlanması
  - Global Theme Manager yapılandırması (Material Theme colors override)