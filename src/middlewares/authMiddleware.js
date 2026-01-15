const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errorHandler');
const authService = require('../services/authService');

/**
 * JWT token doğrulama middleware
 * Authorization header'dan token'ı alır ve doğrular
 */
const authenticate = async (req, res, next) => {
    try {
        // Token'ı header'dan al
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Lütfen giriş yapın', 401);
        }

        const token = authHeader.split(' ')[1];

        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Kullanıcıyı bul
        const user = await authService.getUserById(decoded.id);

        // Kullanıcıyı request'e ekle
        req.user = user;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Geçersiz token', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token süresi dolmuş, lütfen tekrar giriş yapın', 401));
        }
        next(error);
    }
};

/**
 * Admin rolü kontrolü middleware
 * Sadece admin kullanıcıların erişimine izin verir
 */
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Bu işlem için admin yetkisi gereklidir', 403));
    }
    next();
};

module.exports = {
    authenticate,
    isAdmin
};
