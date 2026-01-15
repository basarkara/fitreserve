# FitReserve - Spor Salonu Randevu Yönetim Sistemi

Spor salonu üyelerinin derslere kontenjan dahilinde kayıt olmasını ve belirli kurallar çerçevesinde iptal edebilmesini sağlayan REST API.

## 🏗️ Mimari

Proje, **Katmanlı Mimari** (Controller-Service-Repository Pattern) prensipleriyle geliştirilmiştir:

- **Controller**: Sadece HTTP request/response yönetimi
- **Service**: Tüm business logic (iş mantığı)
- **Model**: Sequelize ORM şemaları

```
src/
├── config/          # Veritabanı bağlantısı
├── controllers/     # HTTP istek yönetimi
├── middlewares/     # Auth ve validasyon
├── models/          # Sequelize şemaları
├── routes/          # API endpoint tanımları
├── services/        # İş mantığı
└── utils/           # Yardımcı fonksiyonlar
```

## 🛠️ Teknolojiler

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Auth**: JSON Web Token (JWT)
- **Validation**: Joi

## 📦 Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd fitreserve
npm install
```

### 2. Veritabanını Oluştur

```sql
CREATE DATABASE fitreserve;
```

### 3. Ortam Değişkenlerini Ayarla

`.env` dosyasını düzenleyin:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fitreserve
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=24h
```

### 4. Uygulamayı Başlat

```bash
# Production
npm start

# Development (nodemon ile)
npm run dev
```

## 📚 API Endpoints

### Auth

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/api/auth/register` | Kayıt Ol | ❌ |
| POST | `/api/auth/login` | Giriş Yap | ❌ |
| GET | `/api/auth/me` | Profil Bilgisi | ✅ |

### Courses (Dersler)

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/api/courses` | Dersleri Listele | ❌ |
| GET | `/api/courses/:id` | Ders Detayı | ❌ |
| POST | `/api/courses` | Ders Ekle | Admin |
| PUT | `/api/courses/:id` | Ders Güncelle | Admin |
| DELETE | `/api/courses/:id` | Ders Sil | Admin |

### Reservations (Rezervasyonlar)

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/api/reservations` | Rezervasyonlarım | ✅ |
| POST | `/api/reservations` | Rezervasyon Yap | ✅ |
| DELETE | `/api/reservations/:id` | Rezervasyon İptal | ✅ |

## 🔐 İş Kuralları

### Kural 1: Kapasite Kontrolü (Rezervasyon Oluşturma)

- Yeni rezervasyon eklenmeden önce kursun `mevcut_katilimci` sayısı `kontenjan` ile karşılaştırılır
- Kontenjan doluysa hata döner
- Başarılı olursa, **Transaction** ile rezervasyon oluşturulup `mevcut_katilimci` +1 artırılır

### Kural 2: Zaman Kısıtlaması (Rezervasyon İptali)

- Dersin `tarih_saat`'i kontrol edilir
- Dersin başlamasına **2 saatten az** kaldıysa iptal izni verilmez
- İptal başarılı olursa `mevcut_katilimci` -1 azaltılır

## 📊 Veritabanı Şeması (ER Diyagramı)

```
┌─────────────┐       ┌───────────────┐       ┌─────────────┐
│   USER      │       │  RESERVATION  │       │   COURSE    │
├─────────────┤       ├───────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)       │    ┌──│ id (PK)     │
│ ad_soyad    │  │    │ user_id (FK)  │◄───┘  │ ders_adi    │
│ email (UK)  │  └───►│ course_id (FK)│       │ egitmen     │
│ sifre       │       │ kayit_tarihi  │       │ tarih_saat  │
│ role        │       └───────────────┘       │ kontenjan   │
└─────────────┘          1:N     1:N          │ mevcut_kat. │
                                              └─────────────┘
```

## 📝 Örnek API Kullanımı

### 1. Kayıt Ol

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "ad_soyad": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "sifre": "123456"
  }'
```

### 2. Giriş Yap

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmet@example.com",
    "sifre": "123456"
  }'
```

### 3. Ders Oluştur (Admin)

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "ders_adi": "Yoga",
    "egitmen": "Ayşe Hoca",
    "tarih_saat": "2026-01-20T10:00:00",
    "kontenjan": 15
  }'
```

### 4. Rezervasyon Yap

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "course_id": 1
  }'
```

### 5. Rezervasyon İptal Et

```bash
curl -X DELETE http://localhost:3000/api/reservations/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📄 Lisans

ISC
