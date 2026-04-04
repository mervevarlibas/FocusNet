# Merve Varlıbaş'ın Web Frontend Görevleri
**Front-end Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Günlük Hedef ve Yüzde Tamamlama Sistemi
- **API Endpoint:** `POST /api/goals, GET /api/me, DELETE /api/goals/{date}`
- **Görev:** Kullanıcının günlük çalışma hedefini belirlemesi, güncellemesi ve bu hedefin gerçekleşme oranını görselleştirmesi.
- **UI Bileşenleri:**
  - Progress Ring (SVG tabanlı dairesel grafik)
  - Tamamlanan ve hedef dakika göstergesi (Örn: 45 / 120 dk)
  - Hedef süresi için "Saat" ve "Dakika" number input alanları
  - "Hedef oluştur / güncelle" butonu (secondary button style)
  - Yüzdelik dilim metni (Örn: %35)
  - **Kullanıcı Deneyimi:**
  - Hedef silme işlemi öncesi browser confirmation dialog (Emin misiniz?)
  - Hedef güncellendiğinde sayfanın anında yenilenmeden verilerin güncellenmesi (refreshDashboard)
- **Teknik Detaylar:**
  - SVG çemberinin (circle) stroke-dashoffset ve stroke-dasharray değerlerinin JavaScript üzerinden dinamik hesaplanması ($2 \cdot \pi \cdot r$).
  - API'den gelen ilerleme yüzdesinin (progressPercent) arayüze gerçek zamanlı entegrasyonu.

  ## 2. Serbest Süre Takibi ve Durdurma (Stopwatch)
- **API Endpoint:** `POST /api/study/log`
- **Görev:** Kullanıcının plansız (serbest) çalışma sürelerini takip etmesi ve süreyi durdurduğunda günlük hedefine eklemesi.
- **UI Bileşenleri:**
  - HH:MM:SS formatında dinamik zamanlayıcı ekranı (Monospace font)
  - "Başlat" butonu (primary button, glow effect)
  - "Durdur & Kaydet" butonu (secondary button)
  - Bilgilendirme metni (hint)
  - **Kullanıcı Deneyimi:**
  - Zamanlayıcı başlatıldığında "Başlat" butonunun disabled olması
  - Zamanlayıcı çalışırken "Durdur & Kaydet" butonunun aktif hale gelmesi
  - Süre durdurulduğunda sayacın sıfırlanması ve göstergenin "00:00:00" durumuna dönmesi
- **Teknik Detaylar:**
  - requestAnimationFrame ve performance.now() API'leri kullanılarak yüksek hassasiyetli, donma yapmayan zaman ölçümü.
  - Milisaniye cinsinden hesaplanan sürenin, API'ye gönderilmeden önce dakikaya (Math.round) çevrilmesi.

  ## 3. Pomodoro Zamanlayıcı Sistemi
- **API Endpoint:** `POST /api/study/log`
- **Görev:** Klasik Pomodoro tekniği ile (25 dk çalışma, 5 dk mola) odaklanma sürelerinin yönetilmesi ve kaydedilmesi.
- **UI Bileşenleri:**
  - Mevcut faz göstergesi ("Çalışma" veya "Mola")
  - MM:SS formatında büyük geri sayım ekranı
  - "Başlat", "Duraklat" ve "Bitir" butonları (State tabanlı aktif/pasif)
  - **Kullanıcı Deneyimi:**
  - 25 dakikalık çalışma periyodu bittiğinde sürenin otomatik olarak sunucuya kaydedilmesi.
  - Çalışma bittiğinde kullanıcının otomatik olarak 5 dakikalık "Mola" fazına geçirilmesi.
  - Duraklatılan sürenin tekrar kaldığı yerden devam ettirilebilmesi.
- **Teknik Detaylar:**
  - setInterval kullanılarak her saniye pomoRemaining state'inin güncellenmesi.
  - State management (running, paused, phase) ile butonların disabled durumlarının yönetilmesi.
  
   ## 4. Arkadaş Ekleme ve Silme Akışı
- **API Endpoint:** `GET /api/friends, POST /api/friends, DELETE /api/friends/{id}`
- **Görev:** Platform içi sosyal etkileşimi sağlamak için arkadaş listesi oluşturma ve çıkarma işlemleri.
- **UI Bileşenleri:**
  - Email input alanı (Arkadaş eklemek için)
  - "Ekle" butonu (Primary style)
  - Dinamik arkadaş listesi (Görünen ad, email ve dinamik renkli initial avatar)
  - Form validasyon hataları için error text alanı
  - **Kullanıcı Deneyimi:**
  - Arkadaş silme butonuna tıklandığında "Arkadaşı listeden çıkar?" onay penceresi (browser confirm)
  - Hata durumunda (Örn: kullanıcı bulunamadı) form altında hata mesajı gösterimi
  - Başarılı ekleme sonrası input'un temizlenmesi ve listenin auto-refresh olması
- **Teknik Detaylar:**
  - DOM manipulation (document.createElement) ile gelen JSON verisinin UI listesine dönüştürülmesi.
  - Avatar renklerinin index'e göre (AVATAR_GRADS) CSS linear-gradient ile dinamik atanması.

## 5. Liderlik Tablosu ve Çalışma Serisi (Streak)
- **API Endpoint:** `GET /api/leaderboard, GET /api/me`
- **Görev:** Kullanıcının motivasyonunu artırmak için ardışık çalışma günlerini ve diğer kullanıcılar arasındaki sıralamasını görüntüleme.
- **UI Bileşenleri:**
  - Dashboard'da şimşek ikonu (⚡) içeren Streak kartı ("X gün üst üste")
  - Sıralama listesi (Kullanıcı adı, toplam süre, streak sayısı)
  - Mevcut kullanıcının durumunu gösteren özet alanı ("Sıranız: #X · Toplam Y dk")
  - **Kullanıcı Deneyimi:**
  - Kendi hesabının liderlik tablosunda özel bir class (.me) ve farklı bir renk ile vurgulanarak kolayca seçilebilmesi.
  - Tabloda null değerlere karşı fallback mekanizması (İsim yoksa email gösterimi).

 ## 6. Profil Özelleştirme ve Ekran Teması Sistemi
- **API Endpoint:** `PUT /api/me`
- **Görev:** Kullanıcının arayüz temasını, görünen adını ve avatar rengini kişiselleştirmesi.
- **UI Bileşenleri:**
  - Üst barda Tema Toggle (☾/☀) butonu
  - 8 farklı renk geçişine sahip, seçilebilir Avatar grid sistemi
  - Ad input alanı ve "Kaydet" butonu
  - Başarı durumu bildirimi ("Kaydedildi")
  - **Kullanıcı Deneyimi:**
  - Tema butonuna basıldığında sayfanın anında Koyu/Açık temaya geçmesi (Optimistic update).
  - Seçilen avatarın UI'da "selected" class'ı ile parlaması (glow effect).
- **Teknik Detaylar:**
  - Tema bilgisinin localStorage üzerine yazılarak oturumlar arası kalıcılığının (client-side persistence) sağlanması.
  - Temanın aynı zamanda API üzerinden (PUT) sunucuya gönderilerek farklı cihazlarda da senkronize edilmesi.
- CSS Variables (Custom Properties) kullanılarak body.theme-light eklendiğinde tüm UI renklerinin (background, text, glass-border) tek tıkla değişmesi.