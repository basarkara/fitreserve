require('dotenv').config();
const express = require('express');
const { sequelize, testConnection } = require('./src/config/db');
const { errorHandler, AppError } = require('./src/utils/errorHandler');
const routes = require('./src/routes');

// Model ilişkilerini yükle
require('./src/models');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (geliştirme için basit ayar)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Ana route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'FitReserve API\'ye Hoş Geldiniz',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            courses: '/api/courses',
            reservations: '/api/reservations',
            health: '/api/health'
        }
    });
});

// API Routes
app.use('/api', routes);

// 404 Handler - Tanımlanmamış route'lar için
app.all('*', (req, res, next) => {
    next(new AppError(`${req.originalUrl} bulunamadı`, 404));
});

// Global Error Handler
app.use(errorHandler);

// Server başlat
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Veritabanı bağlantısını test et
        await testConnection();

        // Tabloları senkronize et (geliştirme için)
        // Production'da { alter: true } veya migration kullanılmalı
        await sequelize.sync({ alter: true });
        console.log('✅ Veritabanı tabloları senkronize edildi.');

        // Sunucuyu başlat
        app.listen(PORT, () => {
            console.log(`
🏋️  FitReserve API Başlatıldı!
📍 URL: http://localhost:${PORT}
🔗 API: http://localhost:${PORT}/api
❤️  Health: http://localhost:${PORT}/api/health

📚 Endpoints:
   POST   /api/auth/register     - Kayıt Ol
   POST   /api/auth/login        - Giriş Yap
   GET    /api/auth/me           - Profil (Auth)
   
   GET    /api/courses           - Dersleri Listele
   GET    /api/courses/:id       - Ders Detayı
   POST   /api/courses           - Ders Ekle (Admin)
   PUT    /api/courses/:id       - Ders Güncelle (Admin)
   DELETE /api/courses/:id       - Ders Sil (Admin)
   
   GET    /api/reservations      - Rezervasyonlarım (Auth)
   POST   /api/reservations      - Rezervasyon Yap (Auth)
   DELETE /api/reservations/:id  - Rezervasyon İptal (Auth)
      `);
        });
    } catch (error) {
        console.error('❌ Sunucu başlatma hatası:', error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;
