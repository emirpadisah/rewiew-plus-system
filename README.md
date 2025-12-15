# Yorum Artırıcı - WhatsApp Review Yönetim Sistemi

WhatsApp üzerinden müşterilerinize otomatik olarak review (değerlendirme) linkleri gönderen, profesyonel bir SaaS uygulaması.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Özellikler](#özellikler)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Kullanım Kılavuzu](#kullanım-kılavuzu)
- [Sık Sorulan Sorular](#sık-sorulan-sorular)
- [Destek](#destek)

## 🎯 Genel Bakış

Yorum Artırıcı, işletmenizin müşterilerine WhatsApp üzerinden otomatik olarak review linkleri göndermenizi sağlar. Bu sayede:

- ✅ Müşterilerinizden daha fazla review alırsınız
- ✅ Google Maps, Tripadvisor gibi platformlarda görünürlüğünüz artar
- ✅ Müşteri memnuniyeti ve güveni yükselir
- ✅ İşletmenizin online itibarı güçlenir

## ✨ Özellikler

### 🏢 İşletme Paneli

**Dashboard**
- Gönderilen mesaj istatistikleri (toplam, başarılı, başarısız)
- WhatsApp bağlantı durumu
- Son gönderilen mesajlar listesi
- Günlük mesaj istatistikleri

**Müşteri Yönetimi**
- Tek tek müşteri ekleme
- CSV dosyası ile toplu müşteri içe aktarma
- Müşteri listesi görüntüleme ve yönetimi
- E.164 formatında telefon numarası doğrulama

**WhatsApp Bağlantısı**
- QR kod ile kolay WhatsApp bağlantısı
- Bağlantı durumu takibi
- Bağlantıyı kapatma ve yeniden bağlanma özelliği

**Mesaj Şablonu ve Ayarlar**
- Özelleştirilebilir mesaj şablonu
- `{firstName}` ve `{reviewUrl}` placeholder desteği
- Review URL yapılandırması
- Ayarları kaydetme ve güncelleme

**Mesaj Gönderme**
- Tek veya çoklu müşteri seçimi
- Mesaj önizleme
- Otomatik rate limiting (spam koruması)
- Mesaj gönderme sonuçları ve logları

### 🔐 Güvenlik ve Performans

- JWT tabanlı güvenli kimlik doğrulama
- HttpOnly cookie kullanımı
- Rate limiting ile spam koruması
- Rastgele gecikmeler ile doğal mesaj gönderimi
- Tüm mesaj işlemleri loglanır

## 🚀 Hızlı Başlangıç

### 1. Giriş Yapma

1. Tarayıcınızda uygulama URL'ini açın
2. Email ve şifrenizle giriş yapın
3. İşletme panelinize yönlendirileceksiniz

### 2. WhatsApp Bağlantısı Kurma

1. Sol menüden **"WhatsApp"** sekmesine gidin
2. **"WhatsApp Bağla"** butonuna tıklayın
3. QR kodu telefonunuzla WhatsApp'tan tarayın
4. Bağlantı durumu **"Bağlı"** olarak göründüğünde hazırsınız

> 💡 **Not:** QR kod görünmüyorsa **"QR Kodu Yenile"** butonuna tıklayın.

### 3. Müşteri Ekleme

**Tek Tek Ekleme:**
1. **"Müşteriler"** sekmesine gidin
2. **"Yeni Müşteri Ekle"** butonuna tıklayın
3. İsim ve telefon numarasını girin (format: +905551234567)
4. **"Kaydet"** butonuna tıklayın

**Toplu Ekleme (CSV):**
1. **"Müşteriler"** sekmesine gidin
2. **"CSV'den İçe Aktar"** butonuna tıklayın
3. CSV dosyanızı seçin (format: `isim,telefon`)
4. Dosya yüklendikten sonra müşteriler otomatik eklenir

**CSV Format Örneği:**
```csv
Ahmet Yılmaz,+905551234567
Ayşe Demir,+905559876543
Mehmet Kaya,+905551112233
```

### 4. Mesaj Şablonu Ayarlama

1. **"Ayarlar"** sekmesine gidin
2. **"Review URL"** alanına review linkinizi girin
3. **"Mesaj Şablonu"** alanına mesajınızı yazın
4. Kullanabileceğiniz placeholder'lar:
   - `{firstName}` - Müşterinin adı
   - `{reviewUrl}` - Review linkiniz
5. **"Kaydet"** butonuna tıklayın

**Örnek Mesaj Şablonu:**
```
Merhaba {firstName}, bizimle deneyiminizi değerlendirmek ister misiniz? {reviewUrl}
```

### 5. Mesaj Gönderme

1. **"Mesaj Gönder"** sekmesine gidin
2. Göndermek istediğiniz müşterileri seçin (çoklu seçim mümkün)
3. Mesaj önizlemesini kontrol edin
4. **"Mesaj Gönder"** butonuna tıklayın
5. Gönderim sonuçlarını takip edin

> ⚠️ **Önemli:** Mesajlar otomatik olarak güvenli aralıklarla gönderilir. Spam koruması için sistem rastgele gecikmeler kullanır.

## 📖 Detaylı Kullanım Kılavuzu

### Dashboard

Dashboard sayfasında şu bilgileri görebilirsiniz:

- **Toplam Mesajlar:** Gönderilen tüm mesajların sayısı
- **Başarılı Mesajlar:** Başarıyla gönderilen mesaj sayısı
- **Başarısız Mesajlar:** Gönderilemeyen mesaj sayısı
- **Başarı Oranı:** Başarılı mesajların yüzdesi
- **Bugünkü Mesajlar:** Bugün gönderilen mesaj sayısı
- **Toplam Müşteriler:** Sisteminizdeki toplam müşteri sayısı
- **WhatsApp Durumu:** WhatsApp bağlantı durumunuz
- **Son Mesajlar:** En son gönderilen mesajların listesi

### Müşteri Yönetimi

**Telefon Numarası Formatı:**
- Telefon numaraları **E.164** formatında olmalıdır
- Format: `+[ülke kodu][numara]`
- Örnek: `+905551234567` (Türkiye için)

**CSV İçe Aktarma:**
- CSV dosyası virgülle ayrılmış olmalıdır
- İlk satır başlık olabilir (otomatik atlanır)
- Format: `İsim,Telefon` veya `isim,telefon`
- Telefon numaraları E.164 formatında olmalıdır

### WhatsApp Bağlantısı

**Bağlantı Durumları:**
- **Bağlı:** WhatsApp bağlantınız aktif, mesaj gönderebilirsiniz
- **Beklemede:** QR kod ile bağlanmayı bekliyor
- **Bağlı Değil:** WhatsApp bağlantısı yok

**Sorun Giderme:**
- QR kod görünmüyorsa **"QR Kodu Yenile"** butonuna tıklayın
- Bağlantı kurulamıyorsa **"Bağlantıyı Kapat"** butonuna tıklayıp yeniden deneyin
- Telefonunuzda WhatsApp'ın açık olduğundan emin olun

### Mesaj Gönderme

**Mesaj Gönderme Süreci:**
1. Sistem mesajları güvenli aralıklarla gönderir (2-5 saniye arası rastgele)
2. Her 5 mesajda bir ek gecikme uygulanır (spam koruması)
3. Maksimum 2 mesaj aynı anda gönderilir
4. Tüm gönderimler loglanır ve sonuçları gösterilir

**Mesaj Gönderme Sonuçları:**
- Başarılı gönderimler yeşil işaretle gösterilir
- Başarısız gönderimler kırmızı işaretle gösterilir
- Hata mesajları detaylı olarak gösterilir

## ❓ Sık Sorulan Sorular

### WhatsApp bağlantısı nasıl çalışır?

WhatsApp bağlantısı Evolution API kullanılarak yapılır. QR kod ile telefonunuzdaki WhatsApp hesabınıza bağlanır. Bu bağlantı güvenlidir ve WhatsApp'ın resmi API'sini kullanır.

### Mesajlar ne kadar sürede gönderilir?

Mesajlar güvenlik ve spam koruması için otomatik olarak gecikmeli gönderilir. Her mesaj arasında 2-5 saniye rastgele gecikme vardır. 100 müşteriye mesaj göndermek yaklaşık 5-10 dakika sürebilir.

### Aynı müşteriye birden fazla mesaj gönderilir mi?

Hayır, sistem aynı müşteriye tekrar mesaj göndermez. Her müşteri için son mesaj gönderme tarihi takip edilir.

### Review URL'i nereden alabilirim?

- **Google Maps:** İşletmenizin Google Maps sayfasından "Değerlendirme Yaz" linkini kopyalayın
- **Tripadvisor:** İşletmenizin Tripadvisor sayfasından review linkini kopyalayın
- **Diğer Platformlar:** İstediğiniz review platformunun linkini kullanabilirsiniz

### Mesaj şablonunu nasıl özelleştirebilirim?

Ayarlar sayfasında mesaj şablonunuzu düzenleyebilirsiniz. `{firstName}` ve `{reviewUrl}` placeholder'larını kullanarak kişiselleştirilmiş mesajlar oluşturabilirsiniz.

### CSV dosyası formatı nasıl olmalı?

CSV dosyanız şu formatta olmalıdır:
```csv
İsim,Telefon
Ahmet Yılmaz,+905551234567
Ayşe Demir,+905559876543
```

### Telefon numarası formatı neden önemli?

WhatsApp mesajları göndermek için telefon numaralarının uluslararası standart formatta (E.164) olması gerekir. Bu format `+[ülke kodu][numara]` şeklindedir.

### Mesaj gönderimi başarısız olursa ne yapmalıyım?

1. WhatsApp bağlantınızın aktif olduğundan emin olun
2. Müşteri telefon numarasının doğru formatta olduğunu kontrol edin
3. Hata mesajını kontrol edin ve gerekirse destek ekibiyle iletişime geçin

## 🆘 Destek

### Teknik Destek

Herhangi bir sorun yaşarsanız veya yardıma ihtiyacınız olursa:

- **Email:** support@rosivadijital.com
- **Telefon:** [Destek numarası]

### Sık Karşılaşılan Sorunlar

**QR Kod Görünmüyor:**
- Sayfayı yenileyin
- "QR Kodu Yenile" butonuna tıklayın
- Tarayıcı cache'ini temizleyin

**Mesaj Gönderilemiyor:**
- WhatsApp bağlantınızın aktif olduğundan emin olun
- Telefon numarası formatını kontrol edin
- Review URL'inizin doğru yapılandırıldığından emin olun

**Müşteri Eklenemiyor:**
- Telefon numarası formatını kontrol edin (E.164)
- CSV dosyası formatını kontrol edin
- Aynı telefon numarasının daha önce eklenmediğinden emin olun

## 📝 Notlar

- Mesajlar otomatik olarak güvenli aralıklarla gönderilir
- Spam koruması için sistem rastgele gecikmeler kullanır
- Tüm mesaj işlemleri loglanır ve takip edilebilir
- WhatsApp bağlantısı güvenlidir ve resmi API kullanır
- Müşteri bilgileri güvenli bir şekilde saklanır

## 🔄 Güncellemeler

Uygulama düzenli olarak güncellenir. Yeni özellikler ve iyileştirmeler için:

- Dashboard'daki bildirimleri kontrol edin
- Email ile gönderilen güncelleme bildirimlerini okuyun

---

**Yorum Artırıcı** ile müşterilerinizden daha fazla review alın ve işletmenizin online itibarını güçlendirin! 🚀
