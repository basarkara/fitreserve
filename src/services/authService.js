const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../utils/errorHandler');

/**
 * Auth Service
 * Kullanıcı kaydı ve giriş işlemlerinin iş mantığını içerir
 */
class AuthService {
    /**
     * Yeni kullanıcı kaydı oluşturur
     * @param {Object} userData - Kullanıcı bilgileri
     * @returns {Object} - Oluşturulan kullanıcı ve token
     */
    async register(userData) {
        const { ad_soyad, email, sifre, role } = userData;

        // Email kontrolü
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new AppError('Bu email adresi zaten kayıtlı', 400);
        }

        // Şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(sifre, salt);

        // Kullanıcıyı oluştur
        const user = await User.create({
            ad_soyad,
            email,
            sifre: hashedPassword,
            role: role || 'uye'
        });

        // Token oluştur
        const token = this.generateToken(user.id);

        // Şifreyi response'dan çıkar
        const userResponse = {
            id: user.id,
            ad_soyad: user.ad_soyad,
            email: user.email,
            role: user.role
        };

        return { user: userResponse, token };
    }

    /**
     * Kullanıcı girişi yapar
     * @param {string} email - Kullanıcı email'i
     * @param {string} sifre - Kullanıcı şifresi
     * @returns {Object} - Kullanıcı bilgileri ve token
     */
    async login(email, sifre) {
        // Kullanıcıyı bul
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new AppError('Email veya şifre hatalı', 401);
        }

        // Şifreyi kontrol et
        const isMatch = await bcrypt.compare(sifre, user.sifre);
        if (!isMatch) {
            throw new AppError('Email veya şifre hatalı', 401);
        }

        // Token oluştur
        const token = this.generateToken(user.id);

        // Şifreyi response'dan çıkar
        const userResponse = {
            id: user.id,
            ad_soyad: user.ad_soyad,
            email: user.email,
            role: user.role
        };

        return { user: userResponse, token };
    }

    /**
     * JWT token oluşturur
     * @param {number} userId - Kullanıcı ID'si
     * @returns {string} - JWT token
     */
    generateToken(userId) {
        return jwt.sign(
            { id: userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
    }

    /**
     * Kullanıcı ID'sine göre kullanıcıyı getirir
     * @param {number} userId - Kullanıcı ID'si
     * @returns {Object} - Kullanıcı bilgileri
     */
    async getUserById(userId) {
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['sifre'] }
        });

        if (!user) {
            throw new AppError('Kullanıcı bulunamadı', 404);
        }

        return user;
    }
}

module.exports = new AuthService();
