1. **Kullanıcı Girişi**
   - **API Metodu:** `POST /api/auth/login`
   - **Açıklama:** Kullanıcı hesap oluşturur ve giriş yapar.Kullanıcılar email adresi veya telefon numarası ile şifre belirleyerek hesap oluşturur.

2. **Arkadaş ekleme**
   - **API Metodu:** `POST /api/friends/{userId}`
   - **Açıklama:** Kullanıcı arkadaşlarının kullanıcı adını aratarak takip edebilir.

3. **Liderlik Tablosu**
   - **API Metodu:** `GET /api/leaderboard`
   - **Açıklama:** Kullanıcıların belirli zaman aralığında (günlük/haftalık/aylık) toplam çalışma sürelerine göre sıralanmasını sağlar.

4. **Takvim**
   - **API Metodu:** `GET /api/calendar`
   - **Açıklama:** Kullanıcının takvimde hangi gün, ne kadar çalıştığını gösterir.
     
5. **Süre Başlatma**
   - **API Metodu:** `POST /api/timer/start`
   - **Açıklama:** Kullanıcı çalışma zamanını takip edebilmesi için süresini başlatır.
     
6. **Şifre Yenileme**
   - **API Metodu:** `UPDATE /api/users/password`
   - **Açıklama:** Kullanıcının önceden belirlediği şifreyi güncelleme işlemi yapmasını sağlar.
  
7. **Hedef Silme**
   - **API Metodu:** `DELETE /api/goals/{id}`
   - **Açıklama:** Kullanıcının önceden kendisi için ayarladığı hedefi silmesi işlemidir.

8. **Avatar Ekleme**
   - **API Metodu:** `PUT /users/avatar`
   - **Açıklama:** Her kullanıcı belirli avatarlar içinden istediğini seçerek kendi profiline ekleyebilir.
     
