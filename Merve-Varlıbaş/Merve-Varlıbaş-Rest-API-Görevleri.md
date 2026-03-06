# Merve Varlıbaş'ın REST API Metotları

**API Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Günlük Hedef   Oluşturma
- **Endpoint:** `POST /api/goals/daily`
- **Request Body:**
    ```json
  {
    "date": "2026-03-06",
  "targetMinutes": 120
  }
  ```
- **Response:** `201 Created` -Günlük hedef oluşturuldu.
- **Authentication:** Bearer Token gerekli

## 2. Arkadaş Silme
- **Endpoint:** `DELETE /api/friends/{friendUserId}`
- **Path Parameters:** 
  `userId` (string, required) – Silinecek kullanıcının ID değeri
- **Authentication:** Bearer Token gerekli
- **Response:** `204 No Content` - Arkadaş başarıyla silindi

## 3.Yüzde Tamamlama Sistemi
- **Endpoint:** `GET /api/progress/completion`
- **Authentication:** Bearer Token gerekli
-  **Response:** `200 OK` -Yüzde tamamlama bilgisi getirildi
- **Request Body:** 
    ```json
  {
    "date": "2026-03-06",
  "targetMinutes": 120,
  "studiedMinutes": 60,
  "completionPercent": 50.0
  }
  ```

## 4. Çalışma Serisi
- **Endpoint:** `GET /api/progress/streak`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` -Streak bilgisi getirildi

## 5. Hedef Değiştirme
- **Endpoint:** `UPDATE /api/goals/daily/{dailyGoalId}`
- **Path Parameters:**
 `dailyGoalId`(string, required) - Güncellenecek hedefin kimliği.
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` -Günlük hedef güncellendi

## 6. Pomodoro Zamanlayıcı
- **Endpoint:** `POST  /api/pomodoro/start`
- **Response:** `201` -Pomodoro başlatıldı

- **Endpoint:** `POST  /api/pomodoro/stop`
- **Response:** `200` -Pomodoro durduruldu

- **Authentication:** Bearer Token gerekli

## 7. Ekran Teması
- **Endpoint:** `PUT  /api/users/theme`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` -Ekran Teması getirildi,
- **Request Body:** 
  ```json
  {
    "mode": "dark" // "light" veya "dark"
  }
  ```

## 8. Süre Durdurma
- **Endpoint:** `POST /api/timers/stop`
- **Response:** `200` -Süre durduruldu
- **Authentication:** Bearer Token gerekli
- **Request Body:** 
  ```json
  {
    "timerSessionId": "ts_123"
  }
  ```

