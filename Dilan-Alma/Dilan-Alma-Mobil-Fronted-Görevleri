# Dilan Alma'nın Mobil Frontend Görevleri
**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)
## 1. Kullanıcı Girişi (Giriş) Ekranı
- **API Endpoint:** `POST /api/auth/login`
- **Görev:** Kullanıcı girişi ve kayıt yönetimi için mobil ekran tasarımı ve uygulaması.
- **UI Bileşenleri:**
- E-posta giriş alanı (klavye türü: e-posta)
- Şifre giriş alanı (güvenli metin girişi)
- "Giriş Yap" butonu (birincil-ışımalı stil)
- "Kayıt Ol" sayfasına yönlendirme linki
- Hata mesajı alanı (satır içi hata)
- **Kullanıcı Deneyimi:**
  - Hatalı girişlerde kullanıcı dostu uyarılar.
  - Başarılı girişte Dashboard'a yumuşak geçiş.
  - Klavyeyi kapat.
- **Teknik Detaylar:**
 - JWT token'ınSharedPreferences / Keychainüzerinde güvenli saklanması.
- Durum yönetimi (yükleme, hata, başarı).
  

  ## 2. Şifre Yenileme (Şifre Sıfırlama) Akışı
- **API Endpoint:** `PPOST /api/auth/reset-password`
- **Görev:** Şifre kurtarma tasarımı ve uygulanması.
- **UI Bileşenleri:**
 - E-posta ve Yeni Şifre giriş alanları
 - "Şifreyi Sıfırla" butonu
 - Başarı (#resetOk) ve Hata (#resetError) bildirim alanları
  
- **Kullanıcı Deneyimi:**
  - İşlem başarılı yeşil olduğunda başarı mesajı gösterimi.
  - Giriş oranlarının azaltılması formülüne veri aktarımı.
  
- **Teknik Detaylar:**
 - Asenkron API isteği (Koroutin/Async).
 - Form validasyonu ve gönderim yönetimi.

  ## 3. Arkadaş Ekleme Sistemi
- **API Endpoint:** `POST /api/friends`
- **Görev:** E-posta ile arkadaş ekleme eklentisi.
- **UI Bileşenleri:**
  - E-posta giriş alanı
  - "Ekle" butonu
  
- **Kullanıcı Deneyimi:**
  - Arka plan API isteği, sayfa yenilenmeden güncel liste gösterimi.
  - Kullanıcının başarısızlığında spesifik hata uyarısı.
  
- **Teknik Detaylar:**
  - RecyclerView/ LazyColumnile liste syncu.
  - API yanıtının ardından listeyi otomatik yenileme (loadFriends).
 ## 4. Liderlik Tablosu (Liderlik Tablosu) Ekranı
- **API Endpoint:** `GET /api/leaderboard`
- **Görev:** Kullanıcıları çalışma sürelerine göre sıralanır.
- **UI Bileşenleri:**
 - Kullanıcının kendi durum özeti alanı
 - Sıralı liste görünümü (Sıra, İsim, Dakika, Streak)
  
- **Kullanıcı Deneyimi:**
  Kullanıcının kendi satırının belirgin (cyan/farklı) renkle vurgulanması.
 - Liste yüklenirken iskelet yükleniyor.
  
- **Teknik Detaylar:**
- Sunucudan gelen verinin mapUI'ya bağlanmasına olanak sağlar.
  
   ## 5.Takvim
- **API Endpoint:** `GET /api/calendar?year={Y}&month={M}`
- **Görev:** Aylık çalışma durumunu görselleştirme.
- **UI Bileşenleri:**
- Ay/Yıl komutanlığı ve İleri/Geri okları
- 7 renkli gün gridi
  
- **Kullanıcı Deneyimi:**
  - Çalışılan günlerin belirgin (camgöbeği) gösterimi.
  - Ay geçişlerinde veri değiştirin.

- **Teknik Detaylar:**
- Tarih programlamaları ve API'den gelen sessionMapile grid eşleştirme.


   ## 6. Hedef Sil (Delete Goal)
- **API Endpoint:** `DELETE /api/goals/{date}`
- **Görev:** Günlük bütçe kesintisi/iptal etme.
- **UI Bileşenleri:**
- Bugünkü hedef sil" butonu (tehlike anahat stili)
 - Onay diyaloğu
  
- **Kullanıcı Deneyimi:**
  - Emin misin?" uyarısı ile yanlışlıkla silmeyi önleme.

  - Silme sonrasında Dashboard'un %0'a dönüşü.

- **Teknik Detaylar:**
  - ISO tarih formatı oluşturma ve dinamik URL yönetimi.

   ## 7. Avatar Ekleme / Seçme Akışı
- **API Endpoint:** `PUT /api/me`
- **Görev:** Kullanıcı avatarını özelleştirme.
- **UI Bileşenleri:**
  - 8 farklı renk seçeneği (4x2 grid)
  - "Kaydet" butonu
- **Kullanıcı Deneyimi:**
  - Seçilen avatarın kalın kenarlık/parlama ile görsel geri bildirimi.
  - Mevcut avatarın otomatik olarak ortaya çıkması.

- **Teknik Detaylar:**
  - Seçilen avatar indeksinin durumu olarak ayrılması ve parçaları PUTile birleştirilmesi.