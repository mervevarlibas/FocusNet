# API Tasarımı - OpenAPI Specification Örneği

**OpenAPI Spesifikasyon Dosyası:** [focusnet.yaml](focusnet.yaml)

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: FocusNet Ders Çalışma Uygulaması API'si
  description: |
    FocusNet platformu için hazırlanmış RESTful API.
    
    ## Özellikler
    - Kullanıcı girişi ve şifre yenileme
    - Arkadaş ekleme, listeleme ve silme
    - Liderlik tablosu (Leaderboard) yönetimi
    - Takvim işlemleri ve günlük hedefler
    - Pomodoro zamanlayıcı (25/5 sabit) ve süre takibi
    - Yüzde tamamlama sistemi ve çalışma serisi (streak)
    - Avatar ve ekran teması yönetimi
    - JWT tabanlı kimlik doğrulama
  version: 1.0.0
  contact:
    name: Merve Varlıbaş, Dilan Alma

servers:
  - url: [https://api.focusnet.com](https://api.focusnet.com)
    description: Üretim sunucusu (Production)
  - url: [https://staging-api.focusnet.com](https://staging-api.focusnet.com)
    description: Test sunucusu (Staging)
  - url: http://localhost:3000
    description: Yerel geliştirme sunucusu (Development)

tags:
  - name: Auth
    description: Kullanıcı girişi ve şifre yenileme
  - name: Friends
    description: Arkadaş ekleme, listeleme ve silme işlemleri
  - name: Leaderboard
    description: Liderlik tablosu görüntüleme
  - name: Calendar
    description: Basit takvim kayıtları
  - name: Timers
    description: Süre başlatma ve durdurma
  - name: Goals
    description: Günlük hedef oluşturma, değiştirme ve silme
  - name: Pomodoro
    description: Pomodoro zamanlayıcı (25 dakika çalışma + 5 dakika mola)
  - name: Users
    description: Avatar ekleme ve ekran teması
  - name: Progress
    description: Yüzde tamamlama sistemi ve çalışma serisi

security:
  - BearerAuth: []

paths:
  /api/auth/login:
    post:
      tags:
        - Auth
      summary: Kullanıcı Girişi
      operationId: login
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/LoginRequest"
            example:
              email: "user@example.com"
              password: "P@ssw0rd!"
      responses:
        "200":
          description: Giriş başarılı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/LoginResponse"
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /api/auth/password-reset:
    post:
      tags:
        - Auth
      summary: Şifre Yenileme
      operationId: passwordReset
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/PasswordResetRequest"
      responses:
        "200":
          description: Şifre yenilendi
        "400":
          description: Kod geçersiz

  /api/friends:
    get:
      tags:
        - Friends
      summary: Arkadaşları Listele
      operationId: listFriends
      responses:
        "200":
          description: Arkadaşlar listelendi
    post:
      tags:
        - Friends
      summary: Arkadaş Ekleme
      operationId: addFriend
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/AddFriendRequest"
      responses:
        "201":
          description: Arkadaş eklendi

  /api/friends/{friendUserId}:
    delete:
      tags:
        - Friends
      summary: Arkadaş silme
      operationId: deleteFriend
      parameters:
        - name: friendUserId
          in: path
          required: true
          schema:
            type: string
      responses:
        "204":
          description: Arkadaş silindi
        "404":
          description: Arkadaş bulunamadı

  /api/leaderboard:
    get:
      tags:
        - Leaderboard
      summary: Liderlik Tablosu
      operationId: getLeaderboard
      responses:
        "200":
          description: Liderlik tablosu getirildi

  /api/calendar:
    post:
      tags:
        - Calendar
      summary: Takvime kayıt ekle
      operationId: createCalendarItem
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CalendarItemCreateRequest"
      responses:
        "201":
          description: Takvim kaydı oluşturuldu

  /api/timers/start:
    post:
      tags:
        - Timers
      summary: Süre Başlatma
      operationId: startTimer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/TimerStartRequest"
      responses:
        "201":
          description: Süre başlatıldı

  /api/timers/stop:
    post:
      tags:
        - Timers
      summary: Süre Durdurma
      operationId: stopTimer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/TimerStopRequest"
      responses:
        "200":
          description: Süre durduruldu

  /api/goals/daily/{dailyGoalId}:
    put:
      tags:
        - Goals
      summary: Hedef Değiştirme
      operationId: updateDailyGoal
      parameters:
        - name: dailyGoalId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/DailyGoalUpdateRequest"
      responses:
        "200":
          description: Günlük hedef güncellendi
    delete:
      tags:
        - Goals
      summary: Hedef Silme
      operationId: deleteDailyGoal
      parameters:
        - name: dailyGoalId
          in: path
          required: true
          schema:
            type: string
      responses:
        "204":
          description: Günlük hedef silindi

  /api/pomodoro/start:
    post:
      tags:
        - Pomodoro
      summary: Pomodoro Başlat (25/5 sabit)
      operationId: startPomodoro
      responses:
        "201":
          description: Pomodoro başlatıldı

  /api/pomodoro/stop:
    post:
      tags:
        - Pomodoro
      summary: Pomodoro Durdur
      operationId: stopPomodoro
      responses:
        "200":
          description: Pomodoro durduruldu

  /api/users/avatar:
    post:
      tags:
        - Users
      summary: Avatar Ekleme
      operationId: uploadAvatar
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: "#/components/schemas/AvatarUploadRequest"
      responses:
        "200":
          description: Avatar güncellendi

  /api/users/theme:
    put:
      tags:
        - Users
      summary: Ekran Temasını Güncelle
      operationId: updateTheme
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ThemeSettings"
      responses:
        "200":
          description: Tema güncellendi

  /api/progress/completion:
    get:
      tags:
        - Progress
      summary: Yüzde Tamamlama Sistemi
      operationId: getCompletion
      responses:
        "200":
          description: Tamamlama bilgisi getirildi

  /api/progress/streak:
    get:
      tags:
        - Progress
      summary: Çalışma Serisi (Streak)
      operationId: getStreak
      responses:
        "200":
          description: Streak bilgisi getirildi

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: "Authorization: Bearer <token>"

  schemas:
    Error:
      type: object
      properties:
        message:
          type: string
          example: "Hata oluştu"
          
    # (Diğer tüm şema detayları focusnet.yaml dosyasının içinde yer almaktadır)
