# Merve Varlıbaş'ın Mobil Backend Görevleri
**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1.Günlük Hedef ve Yüzde Tamamlama Sistemi
- **API Endpoint:** `POST /api/goals, GET /api/me, DELETE /api/goals/{date}`
- **Görev:** Kullanıcının günlük çalışma hedefini belirlemesi, güncellemesi ve bu hedefin gerçekleşme oranını mobil arayüzde görselleştirmesi.
- **İşlevler:**
  - Dinamik Sayaç: Tamamlanan ve hedef dakika göstergesi (Örn: 45 / 120 dk).
  - Circular Progress View: İlerlemeyi gösteren dairesel grafik bileşeni.
  - Hedef Belirleme: Mobil klavyeye (Number Pad) uygun saat ve dakika giriş alanları (TextField).
  - Kullanıcı Deneyimi (UX): Hedef silme işlemi öncesi yerel onay penceresi (Native Alert Dialog). Hedef güncellendiğinde ekranın anında (reactive) yenilenmesi.
- **Teknik Detaylar:**
  - Özel çizim (Custom Canvas / Custom Painter) yapılarak dairesel ilerleme çubuğunun dinamik hesaplanması.
  - API'den gelen ilerleme yüzdesinin (progressPercent) State Management araçlarıyla (örn. ViewModel, Provider vb.) UI'a gerçek zamanlı bağlanması.

 ## 2.Serbest Süre Takibi ve Durdurma (Stopwatch)
 - **API Endpoint:** `POST /api/study/log`
- **Görev:** Kullanıcının plansız (serbest) çalışma sürelerini takip etmesi ve süreyi durdurduğunda günlük hedefine eklemesi.
- **İşlevler:**
  - Dijital Saat Görünümü: HH:MM:SS formatında, Monospace font kullanılan büyük zaman metni (TextView/Text Widget).
  - Aksiyon Butonları: Görsel geri bildirimi olan "Başlat" (Primary) ve "Durdur & Kaydet" (Secondary) butonları.
  - Kullanıcı Deneyimi (UX): Zamanlayıcı başlatıldığında "Başlat" butonunun inaktif (disabled) olması. Sayacın durdurulmasıyla arayüzün sıfırlanıp "00:00:00" durumuna dönmesi.
  - **Teknik Detaylar:**
  - Mobil platformun native Timer / Handler sınıfları kullanılarak yüksek hassasiyetli zaman ölçümü.
  - Uygulama arka plana alındığında (background state) sürenin doğru hesaplanmaya devam etmesi için yaşam döngüsü (Lifecycle) yönetimi.

  ## 3.Pomodoro Zamanlayıcı Sistemi
  - **API Endpoint:** `POST /api/study/log`
- **Görev:** Klasik Pomodoro tekniği ile (25 dk çalışma, 5 dk mola) odaklanma sürelerinin mobilde yönetilmesi ve kaydedilmesi.
- **İşlevler:**
  - Geri Sayım Sayacı: MM:SS formatında büyük geri sayım arayüzü.
  - Kullanıcı Deneyimi (UX): 25 dakikalık periyot bittiğinde 5 dakikalık mola fazına otomatik geçiş ve kullanıcının uyarılması.
  - Kontrol Mekanizması: "Başlat", "Duraklat" ve "Bitir" durumlarına göre değişen ikonlu butonlar.
  - **Teknik Detaylar:**
  - Buton durumlarının State Management ile aktif/pasif kontrolü.
  - Süre bittiğinde kullanıcıyı uyarmak için cihazın donanım özelliklerinin (Titreşim/Vibrator veya Yerel Bildirim/Local Notification) kullanılması.

  ## 4.Arkadaş Ekleme ve Silme Akışı
  - **API Endpoint:** `GET /api/friends, POST /api/friends, DELETE /api/friends/{id}`
- **Görev:** Platform içi sosyal etkileşimi sağlamak için mobil arkadaş listesi oluşturma ve çıkarma işlemleri.
- **İşlevler:**
  - Kullanıcı Deneyimi (UX): Arkadaş silmek için liste elemanını sağa/sola kaydırma (Swipe-to-delete) veya uzun basma (Long press) ile Native onay penceresi açılması.
  - Hata durumunda (kullanıcı bulunamadı vb.) ekranda uyarı mesajı (Snackbar/Toast) gösterimi.
  - Dinamik Liste: Görünen ad, email ve dinamik renkli avatar içeren liste elemanları (List Item).
  - **Teknik Detaylar:**
  - JSON verisinin parse edilip liste adaptörüne (Adapter) bağlanması.
  - Avatar renklerinin index'e göre dinamik olarak hesaplanıp arka plan rengi (Shape Drawable) olarak atanması.

  ## 5.Liderlik Tablosu ve Çalışma Serisi (Streak)
  - **API Endpoint:** `GET /api/leaderboard, GET /api/me`
- **Görev:** Kullanıcının motivasyonunu artırmak için ardışık çalışma günlerini ve diğer kullanıcılar arasındaki sıralamasını görüntüleme.
- **İşlevler:**
  - Kullanıcı Deneyimi (UX): Listenin en üstünde veya altında "Aşağı çekerek yenile" (Pull-to-refresh) mekanizması. Kendi hesabının farklı bir renk/vurgu ile tabloda kolayca seçilebilmesi.
  - Sıralama Listesi: Kullanıcı adı, toplam süre ve streak sayısını gösteren kaydırılabilir liste.
  - Streak Kartı: Ana ekranda şimşek ikonu (⚡) içeren vurgulu seri (streak) kart tasarımı (CardView).
  - **Teknik Detaylar:**
  - Veri gelene kadar ekranda yükleniyor animasyonu (Skeleton loading veya Spinner) gösterilmesi.
  - API'den gelen verilerin asenkron olarak çekilip, ana iş parçacığını (Main Thread/UI Thread) dondurmadan arayüze yansıtılması.

  ## 6.Profil Özelleştirme ve Ekran Teması Sistemi
  - **API Endpoint:** `PUT /api/me`
- **Görev:** Kullanıcının arayüz temasını (Koyu/Açık), görünen adını ve avatar rengini mobil cihazında kişiselleştirmesi.
- **İşlevler:**
  - Tema Değiştirici: Koyu/Açık mod için geçiş anahtarı (Switch/Toggle Button)
  - Renk Seçici: Avatar için seçilebilir renk paleti (Grid Layout).
  - Profil Formu: Ad düzenleme alanı ve "Kaydet" butonu.
  - **Teknik Detaylar:**
  - Global tema yöneticisi (ThemeManager) ile sistem temasının dinlenmesi ve manuel seçimlerde tüm uygulamanın renk şemasının (Material Theme vb.) anında güncellenmesi.
  - Tercihlerin API üzerinden (PUT) sunucuya asenkron olarak gönderilmesi.