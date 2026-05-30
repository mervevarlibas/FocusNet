# Mobil Frontend Görev Dağılımı

---
## Grup Üyelerinin Mobil Frontend Görevleri

1. [Merve Varlıbaş'ın Mobil Frontend Görevleri](Merve-Varlıbaş/Merve-Varlıbaş-Mobil-Frontend-Görevleri.md)
2. [Dilan Alma'nın Mobil Frontend Görevleri](Dilan-Alma/Dilan-Alma-Mobil-Frontend-Görevleri.md)
---

## Genel Mobil Frontend Prensipleri

### 1. Tasarım Sistemi (FocusNet Design System)
- **Renk Paleti:** Dinamik tema (Koyu/Açık mod) desteği. Liderlik tablosunda kullanıcının kendini kolayca bulabilmesi için özel vurgu renkleri (Örn: Cyan).
- **Tipografi:** Okunabilir ana fontların yanı sıra; kronometre, Pomodoro ve takvim bileşenleri için sabit genişlikli (Monospace) zamanlayıcı fontları.
- **Spacing:** Tutarlı padding/margin değerleri (8dp/8pt grid sistemi) ve kartlar arası hiyerarşi.
- **Özel UI Bileşenleri:** Çalışma süresi için dinamik dairesel grafikler (Progress Ring), Streak (⚡) kartları ve 8 farklı linear-gradient seçeneği sunan dinamik Avatar sistemi.

### 2. Responsive Tasarım ve Düzen
- Liderlik tablosu, arkadaş listesi, 4x2 Avatar seçici gridi ve 7 sütunlu (Pzt-Paz) aylık takvim (Calendar) görünümünün farklı ekran boyutlarına (telefon/tablet) kırılmadan uyum sağlaması.
- Klavye açıldığında formların (özellikle giriş, kayıt ve profil düzenleme) kaybolmaması için ScrollView / KeyboardAvoidingView kullanımı.

### 3. Kullanıcı Deneyimi (UX)
- **Loading States:** Liderlik tablosu ve arkadaş listesi yüklenirken Skeleton Screens (yükleme iskeletleri); veri yoksa (henüz arkadaş eklenmemişse) özel bilgilendirici "Empty State" ekranları.
- **Feedback:** Başarılı profil güncellemeleri veya şifre sıfırlamaları sonrası anlık Toast/Snackbar mesajları.
- **Yıkıcı Aksiyonlar:** Hesap silme, arkadaş çıkarma veya günlük hedefi sıfırlama gibi işlemlerde "Emin misiniz?" diyalogları (Native Alert/Confirm).
- **Hızlı Etkileşim:** Arkadaş silmek için kaydırma (Swipe-to-delete) mekanizması. Tema değiştirildiğinde veya süre hedefleri güncellendiğinde ekranın anında (Optimistic update) tepki vermesi.

### 4. Erişilebilirlik (Accessibility)
- Dokunma (Touch target) boyutlarının butonlar, Pomodoro kontrolleri (Başlat/Duraklat) ve takvim hücreleri için en az 44x44dp/pt olması.
- Koyu (Dark) ve Açık (Light) temalar arası geçişlerde yüksek kontrast oranlarının korunması.
- Screen reader (Ekran okuyucu) desteği için özellikle kronometre ekranlarına uygun içerik açıklamaları (content descriptions).

### 5. Performans
- Zamanlayıcı Performansı: Kronometre ve Pomodoro sayaçlarının (60 FPS hedefiyle) ana iş parçacığını (Main Thread) dondurmadan, yüksek hassasiyetle arka planda da doğru çalışmaya devam etmesi.
- Liste Optimizasyonu: Çok fazla kayıt içeren Liderlik Tablosu ve Arkadaş Listesi için Lazy Loading (RecyclerView / LazyColumn) kullanımı.
- Profil fotoğrafları ve UI asset'leri için Image optimization ve caching stratejileri.

### 6. Navigasyon
- Giriş/Kayıt/Şifre Sıfırlama akışlarından ana uygulamaya yumuşak geçiş.
- Alt gezinme çubuğu (Bottom Navigation) ile Dashboard (Hedef/Takvim), Odaklanma (Timer), Sosyal (Liderlik/Arkadaşlar) ve Profil sekmeleri arası durum kaybetmeden geçiş.
- Kayıt işleminden sonra otomatik olarak Giriş (Login) sayfasına yönlendirme (Navigation Reset).

### 7. Form Yönetimi
- Anlık Doğrulama (Real-time Validation): Auth akışında (Giriş/Kayıt) email ve şifre kurallarının anlık kontrolü, hata mesajlarının ilgili alanın hemen altında gösterilmesi (Örn: "Şifreler eşleşmiyor").
- Klavye Yönetimi: Şifreler için gizli giriş (secure text entry), hedef dakika/saat girişlerinde ve telefon numaralarında Sadece Rakam (Number Pad) klavyesinin açılması.
- Formlarda değişiklik yapılmadıysa "Kaydet" butonunun inaktif (disabled) olarak bekletilmesi.

### 8.Platform Özellikleri (Native Feel)
- Pomodoro çalışma periyodu bittiğinde mola fazına geçerken cihazın titreşim donanımını (Haptic Feedback) kullanma.
- Android: Material Design 3 guidelines (Örn: Native Snackbar, Material Switch).
- iOS: Human Interface Guidelines (Örn: Native Action Sheet, Toggle).
- Uygulama arka plana atıldığında sürenin takip edilebilmesi için mobil işletim sistemine uygun yaşam döngüsü (Lifecycle) entegrasyonları.