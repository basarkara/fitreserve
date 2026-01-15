const authService = require('../services/authService');
const { successResponse } = require('../utils/helpers');
const { catchAsync } = require('../utils/errorHandler');

/**
 * Auth Controller
 * HTTP isteklerini karşılar, iş mantığını service'e devreder
 */

/**
 * Kullanıcı kaydı
 * POST /api/auth/register
 */
const register = catchAsync(async (req, res, next) => {
    const result = await authService.register(req.body);

    successResponse(res, 201, 'Kayıt başarılı', result);
});

/**
 * Kullanıcı girişi
 * POST /api/auth/login
 */
const login = catchAsync(async (req, res, next) => {
    const { email, sifre } = req.body;

    const result = await authService.login(email, sifre);

    successResponse(res, 200, 'Giriş başarılı', result);
});

/**
 * Mevcut kullanıcı bilgilerini getir
 * GET /api/auth/me
 */
const getMe = catchAsync(async (req, res, next) => {
    const user = await authService.getUserById(req.user.id);

    successResponse(res, 200, 'Kullanıcı bilgileri', user);
});

module.exports = {
    register,
    login,
    getMe
};
