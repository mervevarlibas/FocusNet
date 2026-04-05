# Dilan Alma'ın Web Frontend Görevleri
**Front-end Test Videosu:** [Test Videosu](https://youtu.be/a_5kTvcUYls)
## 1.Kullanıcı Girişi (Login) Sayfası
- **API Endpoint:** `POST /api/auth/login`
- **Görev:** Kayıtlı kullanıcıların sisteme güvenli şekilde giriş yapabilmesi ve oturum yönetiminin başlatılması.
- **UI Bileşenleri:**Tab tabanlı navigasyon (Giriş / Kayıt arası geçiş için)
 - E-posta input alanı (type="email", autocomplete="email")
- Şifre input alanı (type="password", autocomplete="current-password")
- Dinamik hata mesajı alanı (#loginError)
- "Giriş Yap" butonu (primary-glow style)
- "Şifremi unuttum / yanlış şifre" linki
- **Kullanıcı Deneyimi:**
- Hatalı şifre veya e-posta durumunda form altında inline error gösterimi.
- Hatalı giriş spesifik olarak şifreden kaynaklıysa, kullanıcıyı şifre sıfırlamaya yönlendiren dinamik mesaj.
- Başarılı giriş sonrasında yumuşak geçiş ile Dashboard sayfasına yönlendirme.
- **Teknik Detaylar:**
fetch API ile JSON payload (email, password) gönderimi.
- Başarılı yanıtta dönen JWT token'ın oturum yönetimi için localStorage'da (focusnet_token) saklanması.
- Kullanıcının önceki tema tercihinin (dark/light) API'den alınarak anında uygulanması.
## 2. Şifre Yenileme (Password Reset) Akışı
- **API Endpoint:** `POST /api/auth/reset-password`
- **Görev:** Şifresini unutan veya değiştirmek isteyen kullanıcılar için hesap kurtarma akışı.
- **UI Bileşenleri:**
 - Bilgilendirme metni (hint)
 - E-posta ve Yeni Şifre input alanları
- Başarı (#resetOk) ve Hata (#resetError) bildirim alanları
- "Şifreyi Sıfırla" butonu ve "Girişe dön" linki
- **Kullanıcı Deneyimi:**
 - Giriş formunda e-posta yazılıysa, sıfırlama formuna geçildiğinde bu değerin otomatik taşınması ($('resetEmail').value = $('loginEmail').value).
- İşlem başarılı olduğunda yeşil success mesajı ("Tamam") gösterilmesi ve şifre inputunun temizlenmesi.
- **Teknik Detaylar:**
 - Login/Register formlarının gizlenip Reset formunun gösterilmesi (DOM toggling).
- Client-side submit prevention (e.preventDefault()).
## 3. Arkadaş Ekleme Sistemi
- **API Endpoint:** `POST /api/friends`
- **Görev:** Kullanıcının e-posta adresi üzerinden platformdaki diğer kullanıcıları arkadaş listesine eklemesi.
- **UI Bileşenleri:**
 - Inline (yan yana) form yapısı
 - E-posta input alanı (required attribute)
 - "Ekle" butonu (primary-glow style)
- **Kullanıcı Deneyimi:**
  - İşlem anında sayfa yenilenmeden arka planda verinin gönderilmesi.
- Başarılı ekleme sonrası input'un temizlenmesi ve arkadaş listesinin otomatik güncellenmesi (auto-refresh).
- Kullanıcı bulunamadığında kırmızı renkli spesifik hata uyarısı.
- **Teknik Detaylar:**
  - Eklenen arkadaşın listede render edilmesi sonrası loadFriends() fonksiyonunun tetiklenmesi ile veri senkronizasyonu.
## 4. Liderlik Tablosu (Leaderboard)
- **API Endpoint:** `GET /api/leaderboard`
- **Görev:** Toplam çalışma süresine göre platform kullanıcılarını sıralayarak rekabet hissi oluşturmak.
- **UI Bileşenleri:**
  - Kişisel durum özeti alanı (#lbMe)
  
<ol> (ordered list) etiketli sıralama tablosu
  -  Her satırda: Sıra numarası, Kullanıcı Adı, Toplam Dakika ve Streak (Seri) bilgisi
- **Kullanıcı Deneyimi:**

  - En üstte kullanıcının kendi sırasının ve toplam dakikasının ayrıca vurgulanması.
- Kullanıcı listesi okunurken kendi isminin .me class'ı sayesinde farklı (cyan) renkle kolayca ayırt edilebilmesi.
- **Teknik Detaylar:**
-  Sunucudan alınan top array'inin map edilerek DOM elementlerinin (list item) JavaScript tarafında dinamik oluşturulması (document.createElement('li')).

- Görünen ad (displayName) boş ise fallback olarak e-posta adresinin gösterilmesi.
## 5.Takvim (Calendar) 
- **API Endpoint:** `GET /api/calendar?year={Y}&month={M}`
- **Görev:** Kullanıcının aylık çalışma dağılımını (hangi gün kaç dakika) görselleştirmek.
- **UI Bileşenleri:**
 - Dinamik Ay ve Yıl başlığı
- Ay geçişleri için İleri/Geri ok butonları (<, >)
- 7 sütunlu (Pzt-Paz) gün gridi
- İçinde gün numarası ve dakika verisi olan interaktif hücreler 
- **Kullanıcı Deneyimi:**
- İçinde çalışılmış dakika bulunan günlerin daha belirgin (cyan text) gösterilmesi.
- İleri/geri oklarına basıldığında verinin sayfa yenilenmeden (AJAX ile) anında güncellenmesi.
- **Teknik Detaylar:**
- JavaScript Date objesi ile ayın kaç gün çektiğinin ve ilk gününün haftanın hangi gününe (startWeekday offset) denk geldiğinin hesaplanması.
- Ayın başlangıcına kadar olan günlerin "empty cell" olarak render edilmesi.
- API'den gelen sessionMap (örn: {"2026-03-10": 45}) verisinin grid üzerindeki günlerle YYYY-MM-DD anahtarı üzerinden eşleştirilmesi.
## 6. Hedef Silme (Delete Goal)
- **API Endpoint:** `DELETE /api/goals/{date}`
- **Görev:** Kullanıcının günlük olarak belirlediği hedefi sıfırlaması/iptal etmesi.
- **UI Bileşenleri:**
  - Bugünkü hedefi sil" butonu (danger outline style)
- Native tarayıcı onay (confirm) diyaloğu
- **Kullanıcı Deneyimi:**
- Yıkıcı (destructive) bir eylem olduğu için kullanıcı tıklar tıklamaz işlemin yapılmaması, "Bugünkü hedef silinsin mi?" uyarısının çıkartılması.
- İşlem tamamlandığında dashboard'un yenilenerek hedef dairesinin (Progress Ring) %0'a dönmesi.
- **Teknik Detaylar:** 
- Silinecek hedefin tarihinin JavaScript tarafında ISO formatına çevrilip kırpılarak (new Date().toISOString().slice(0, 10)) dinamik endpoint URL'i oluşturulması.

## 7.Avatar Ekleme / Seçme Akışı

- **API Endpoint:** `PUT /api/me`
- **Görev:**Kullanıcının platformdaki görsel kimliğini (avatar rengi/deseni) özelleştirmesi.
- **UI Bileşenleri:**
  - 4 sütunlu (4x2 grid) Avatar seçici paneli (#avatarPicker)
  - 8 farklı linear-gradient renk opsiyonu (A-H arası harflerle temsil edilen)
- "Kaydet" butonu ve #profileOk başarı metni
- **Kullanıcı Deneyimi:**
 - Seçilen avatarın kalın kenarlık (border-color) ve parlama (box-shadow) ile görsel geri bildirim sağlaması (selected state).
 - Sayfa ilk yüklendiğinde kullanıcının mevcut avatarının sistem tarafından otomatik seçili hale getirilmesi.
- **Teknik Detaylar:** 
- Renk dizisinin client-side bir array'de (AVATAR_GRADS) tutulması.
 - Tıklanan avatarın indeks numarasının selectedAvatar değişkeninde tutularak PUT isteği sırasında avatarIndex key'i ile sunucuya gönderilmesi.
