# Dilan Alma'nın REST API Metotları

**API Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Kullanıcı Girişi
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
    ```json
  {
  "email": "user@example.com",
  "password": "P@ssw0rd!"
  }
  ```
- **Response:** `200 OK` -Giriş başarılı
- **Authentication:** Bearer Token gerekli değil

## 2. Arkadaş Ekleme
- **Endpoint:** `POST /api/friends/{friendUserId}`
- **Authentication:** Bearer Token gerekli 
- **Response:** `201` - Arkadaş başarıyla eklendi
- **Request Body:** 
    ```json
  {
   "friendUserId": "usr_456"
  }
  ```

## 3. Liderlik Tablosu
- **Endpoint:** `GET /api/leaderboard`
- **Authentication:** Bearer Token gerekli
-  **Response:** `200 OK` -Liderlik tablosu getirildi

## 4. Takvim
- **Endpoint:** `GET / api/calendar`
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` -Takvim kaydı oluşturuldu.
  **Request Body:** 
    ```json
  {
   "date": "2026-03-08",
  "title": "Plan"
  }
  ```

## 5. Süre Başlatma
- **Endpoint:** `POST /api/timer/start`
- **Authentication:** Bearer Token gerekli
- **Response:** `201 created` - Süre başarıyla başlatıldı.

## 6. Şifre Yenileme
- **Endpoint:** `UPDATE  /api/auth/password-reset`
- **Response:** `200 OK` -Şifre başarıyla yenilendi
- **Request Body:** 
  ```json
  {
    "email": "user@example.com",
  "oneTimeCode": "193847",
  "newPassword": "N3wP@ssw0rd!"
  }
  ```
- **Authentication:** Bearer Token gerekli değil

## 7. Hedef Silme
- **Endpoint:** `DELETE /api/goals/daily/{dailyGoalId}`
-  **Path Parameters:** `dailyGoalId` (string, required) - Silinecek günlük hedefin ID
- **Authentication:** Bearer Token gerekli
- **Response:** `204` -Günlük hedef silindi.

## 8. Avatar Ekleme
- **Endpoint:** `POST /api/users/avatar`
- **Response:** `200` -Avatar güncellendi
- **Authentication:** Bearer Token gerekli
- **Request Body:** 
  ```json
  {
  "avatarUrl": "https://cdn.example.com/avatars/usr_123.png"
  }
  ```
