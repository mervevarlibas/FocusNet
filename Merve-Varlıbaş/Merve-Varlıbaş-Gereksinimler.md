1. **Günlük Hedef Oluşturma**
   - **API Metodu:** `POST /api/goals/daily`
   - **Açıklama:** Kullanıcı girdiği gün kaç saat çalışacağını belirler.

2. **Arkadaş silme**
   - **API Metodu:** `DELETE /api/friends/{friendsId}`
   - **Açıklama:** Kullanıcı eklediği arkadaşlarını çıkarabilir.

3. **Yüzde Tamamlama Sistemi**
   - **API Metodu:** `GET /api/goals/progress`
   - **Açıklama:** Kullanıcının belirlediği hedefe göre yaptığı çalışmaların yüzde kaçını tamamladığını hesaplayıp gösterir.

4. **Çalışma Serisi**
   - **API Metodu:** `GET /api/streak`
   - **Açıklama:** Kullanıcının kaç gün art arda girip çalışmasını tamamladığını gösterir.
     
5. **Hedef Değiştirme**
   - **API Metodu:** `UPDATE /api/goals/{goalId}`
   - **Açıklama:** Kullanıcının daha önce çalışması için planladığı hedef süreyi değiştirmesini sağlar.
     
6. **Pomodoro Zamanlayıcı**
   - **API Metodu:** `POST /api/pomodoro`
   - **Açıklama:** Kullanıcının verimli çalışabilmesi için belirli mola/ders süresine göre zamanı ayarlamasını sağlar.
  
7. **Ekran Teması**
   - **API Metodu:** `PUT /api/users/theme`
   - **Açıklama:** Kullanıcının ekranını koyu veya aydınlık mod olarak ayaralamasını sağlar.

8. **Süre Durdurma**
   - **API Metodu:** `POST /api/timer/stop`
   - **Açıklama:** Kullanıcı çalışma zamanını takip edebilmesi için süresini durdurabilir.
