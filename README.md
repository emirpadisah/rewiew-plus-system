# Yorum Artırıcı - WhatsApp Review SaaS

WhatsApp üzerinden müşterilere Google Maps / Tripadvisor review linkleri gönderen SaaS uygulaması.

## Özellikler

- **Admin Panel**: İşletme yönetimi, kullanıcı oluşturma, istatistikler
- **Business Panel**: Müşteri yönetimi, WhatsApp bağlantısı, mesaj gönderme
- **WhatsApp Entegrasyonu**: Evolution API ile QR kod tabanlı bağlantı
- **Toplu Mesaj Gönderme**: Rate limiting ile güvenli mesaj gönderme
- **CSV İçe Aktarma**: Toplu müşteri ekleme

## Teknolojiler

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase (Database)
- JWT Authentication (HttpOnly Cookies)
- Evolution API (WhatsApp)

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Environment Değişkenlerini Ayarlayın

`.env.local` dosyası oluşturun:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars

# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your_evolution_api_key

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Veritabanı Şemasını Oluşturun

Supabase SQL Editor'da `supabase/schema.sql` dosyasındaki SQL'i çalıştırın.

### 4. Development Server'ı Başlatın

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Veritabanı Şeması

### Tablolar

- `businesses`: İşletmeler
- `users`: Kullanıcılar (admin ve business)
- `customers`: Müşteriler
- `whatsapp_connections`: WhatsApp bağlantıları
- `message_logs`: Mesaj logları
- `business_settings`: İşletme ayarları (review platform ve URL)

## Kullanım

### Admin Girişi

1. İlk admin kullanıcısını veritabanında manuel olarak oluşturun:
   - `users` tablosuna admin rolü ile kullanıcı ekleyin
   - Password hash için bcrypt kullanın (salt rounds: 10)

### İşletme Yönetimi

1. Admin panelinden yeni işletme oluşturun
2. İşletme için business kullanıcısı oluşturun
3. İşletme durumunu aktif/pasif yapın
4. Abonelik tarihlerini güncelleyin

### WhatsApp Bağlantısı

1. Business panelinden "WhatsApp Bağla" butonuna tıklayın
2. QR kodu telefonunuzla tarayın
3. Bağlantı durumunu kontrol edin

### Mesaj Gönderme

1. Müşterileri ekleyin (tek tek veya CSV ile)
2. Ayarlar sayfasından review platform ve URL'yi yapılandırın
3. Mesaj Gönder sayfasından müşterileri seçin
4. Mesajı gönderin

## Mesaj Gönderme Kuralları

- Mesajlar tek tek gönderilir
- Her mesaj arasında 300-900ms random delay
- Maksimum concurrency: 2-3
- Tüm mesajlar `message_logs` tablosuna kaydedilir

## Mimari

### Data Layer Pattern

Tüm veritabanı işlemleri repository pattern ile yapılır:
- `src/lib/db/repositories/` - Repository dosyaları
- Route handler'lar ve component'ler doğrudan Supabase query yazmaz
- İleride Prisma'ya geçiş için soyutlanmış yapı

### Authentication

- JWT tabanlı authentication
- HttpOnly cookies ile güvenli token saklama
- Middleware ile route koruması
- Multi-tenant izolasyon: JWT içindeki `businessId` ile

## Production Deployment

1. Environment değişkenlerini production değerleri ile güncelleyin
2. `JWT_SECRET` için güçlü bir key kullanın (min 32 karakter)
3. `NODE_ENV=production` ayarlayın
4. Supabase production database kullanın
5. Evolution API production instance kullanın

## Lisans

MIT

