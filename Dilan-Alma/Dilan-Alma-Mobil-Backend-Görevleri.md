# Dilan ALma'nın Mobil Backend Görevleri
**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Üye Olma (Kayıt) Servisi
- **API Endpoint:** `POST /api/auth/login`
- **Görev:**Mobil uygulamadan gelen kullanıcı girişlerinin doğrulanması ve güvenli oturum açma yönetiminin (JWT) çalıştırılması.
- **İşlevler:**
  -Mobil client'tan gelen JSON payload (email, password) verisini karşılama.
- Veritabanında e-posta adresine göre kullanıcı sorgulama.
- Girilen şifre ile veritabanındaki hash'lenmiş (şifrelenmiş) şifrenin karşılaştırılması.
 - Doğrulama başarılıysa kullanıcı bilgileri (tema, avatarIndex) ve JWT (JSON Web Token) oluşturup geri döndürme.
- **Teknik Detaylar:**
  -BCrypt veya Argon2 ile şifre hash doğrulama algoritmaları.
 - Token tabanlı kimlik doğrulama (JWT Bearer Authentication).
- Hata durumlarında doğru HTTP statü kodlarının dönülmesi (Bulunamadıysa 404 Not Found, Şifre yanlışsa 401 Unauthorized).

## 2. Şifre Yenileme (Password Reset) Servisi
- **API Endpoint:** `POST /api/auth/reset-password`
- **Görev:** Şifresini unutan kullanıcıların veritabanındaki şifre kayıtlarının güvenli bir şekilde güncellenmesi.
- **İşlevler:**
  - İstek atılan e-posta adresinin sistemde kayıtlı olup olmadığını kontrol etme.
 - Formdan gelen yeni şifreyi (güvenlik standartlarına uyuyorsa) hash'leyerek (şifreleyerek) veritabanında güncelleme.
 - İşlem sonrası eski token'ları geçersiz kılma (isteğe bağlı güvenlik önlemi).
- **Teknik Detaylar:**
  - Request Body validasyonu (Şifre uzunluğu ve zorluk derecesi kontrolü).
  - Veritabanı Transaction (işlem) yönetimi.
 - Başarılı işlemde 200 OK, kullanıcı yoksa güvenlik amacıyla yine 200 OK veya 404 Not Found dönme stratejisi.


  ## 3. Arkadaş Ekleme Servisi
- **API Endpoint:** `POST /api/friends`
- **Görev:** İki kullanıcı arasında veritabanı üzerinde arkadaşlık ilişkisi (ilişkisel tablo kaydı) oluşturulması.
- **İşlevler:**
  - İstek atan kişinin (Token'dan alınan UserID) e-posta adresi verilen diğer kullanıcıyı bulması.
 - Kullanıcının kendini eklemesini engelleme mantığı (Business Logic).
 - Kullanıcıların zaten arkadaş olup olmadığını kontrol etme.
 - İki ID'yi (User A ve User B) bağlayan veritabanı kaydının atılması.
- **Teknik Detaylar:**
  - Veritabanında Many-to-Many (Çoka çok) ilişki tablosu yönetimi (örn: UserFriends tablosu).
  - Veri tutarsızlıklarını önlemek için Conflict yönetimi (Zaten arkadaşlarsa 409 Conflict dönülmesi).

  ## 4. Liderlik Tablosu (Leaderboard) Servisi
- **API Endpoint:** `GET /api/leaderboard`
- **Görev:**Sistemdeki tüm kullanıcıların çalışma sürelerinin hesaplanıp, sıralanarak mobil uygulamaya servis edilmesi.
- **İşlevler:**
  - Kullanıcıların ve çalışma loglarının (StudyLogs) veritabanından join'lenerek (birleştirilerek) çekilmesi.
  - Her kullanıcının "toplam çalışma süresinin" ve "streak (seri)" bilgisinin hesaplanması.
  - Verilerin toplam dakikaya göre azalan (Descending) şekilde sıralanması.
  - İstek atan kullanıcının (Current User) listedeki sırasının ayrıca hesaplanıp JSON response'a eklenmesi
- **Teknik Detaylar:**
  - Veritabanı tarafında Aggregation (Toplama) işlemleri (GROUP BY, SUM, ORDER BY).
  - (Opsiyonel/Puan için) Sık çağrılan bu verinin her seferinde veritabanını yormaması için Redis kullanılarak önbelleğe (Cache) alınması.
  - Görünen ad (displayName) null ise backend tarafında fallback olarak email adresinin maskelenerek (örn: ali***@mail.com) gönderilmesi.

  ## 5. Takvim (Calendar) Veri Servisi
- **API Endpoint:** `GET /api/calendar?year={Y}&month={M}`
- **Görev:** Kullanıcının belirli bir aya ait günlük çalışma dakikalarının filtrelenip gruplanarak mobil cihaza gönderilmesi.
- **İşlevler:**
  - Query parametrelerinden (year ve month) yola çıkarak ilgili ayın başlangıç ve bitiş tarihlerini hesaplama.
 - Sadece isteği atan kullanıcıya ait ve bu tarih aralığındaki çalışma kayıtlarını (StudyLogs) filtreleme.
 - Kayıtları günlere (YYYY-MM-DD) göre gruplayarak, her günün toplam dakikasını hesaplama.
- **Teknik Detaylar:**
  - Tarih/Zaman nesneleri üzerinde sunucu tarafında (Server-side) güvenli filtreleme (WHERE date >= startDate AND date <= endDate).
 - Mobil uygulamanın kolayca okuyabilmesi için dönen veriyi Dictionary / Map ({"2026-03-10": 45}) veri yapısına dönüştürme.

  ## 6. Hedef Silme (Delete Goal) Servisi
- **API Endpoint:** `DELETE /api/goals/{date}`
- **Görev:** Kullanıcının belirli bir tarihe ait günlük hedef kaydının veritabanından silinmesi.
- **İşlevler:**
  - URL path'inden gelen {date} parametresini okuma ve formatını doğrulama.
 - Token'dan alınan mevcut kullanıcının ID'si ile hedef tablosunda eşleşen kaydı bulma.
 - İlgili hedef satırını veritabanından silme (veya soft-delete ile gizleme).
- **Teknik Detaylar:**
  - HTTP DELETE metodunun kurallarına uygun implementasyon.
  - Yetki kontrolü (Kullanıcı başkasının hedefini silemesin diye UserID eşleşmesi doğrulaması).
  - İşlem başarılı olduğunda içerik dönmeden 204 No Content statü kodu gönderilmesi.

 ## 7. Avatar/Profil Güncelleme Servisi
- **API Endpoint:** `PUT /api/me`
- **Görev:** Kullanıcının mobil arayüzden seçtiği avatar indeks değerinin (0-7 arası) veritabanına kaydedilmesi.
- **İşlevler:**
  - Mobil client'tan gelen avatarIndex (ve varsa diğer profil güncellemeleri) bilgisini karşılama.
 - Gelen indeks değerinin 0 ile 7 arasında olup olmadığını sunucu tarafında doğrulama (Validation).
 - İlgili kullanıcının veritabanı satırındaki avatar kolonunu güncelleme.
- **Teknik Detaylar:**
  - Partial Update (Kısmı Güncelleme) yaklaşımı ile sadece gönderilen alanların güncellenmesi.
  - Data Annotation / Validator yapıları ile geçersiz veya sınır dışı verilerin engellenmesi (örn: 400 Bad Request dönülmesi).


