const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

/**
 * Auth Routes
 * /api/auth
 */

// POST /api/auth/register - Kayıt ol
router.post('/register', validate('register'), authController.register);

// POST /api/auth/login - Giriş yap
router.post('/login', validate('login'), authController.login);

// GET /api/auth/me - Kullanıcı bilgilerini getir (Korumalı)
router.get('/me', authenticate, authController.getMe);

module.exports = router;
