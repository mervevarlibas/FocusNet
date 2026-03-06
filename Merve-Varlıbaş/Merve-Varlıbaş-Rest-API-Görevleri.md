# Merve Varlıbaş'ın REST API Metotları

**API Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Günlük Hedef   Oluşturma
- **Endpoint:** `POST /api/goals/daily`
- **Request Body:**
- **Response:** `201 Created` -Günlük hedef oluşturuldu.

## 2. Arkadaş Silme
- **Endpoint:** `DELETE /api/friends/{friendUserId}`
- **Path Parameters:** 
  `userId` (string, required) – Silinecek kullanıcının ID değeri
