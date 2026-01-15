const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // SQL loglarını kapatır, geliştirme için true yapabilirsiniz
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true, // createdAt ve updatedAt otomatik eklenir
      underscored: true // snake_case kullanılır
    }
  }
);

// Bağlantıyı test et
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL veritabanı bağlantısı başarılı.');
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error.message);
  }
};

module.exports = { sequelize, testConnection };
