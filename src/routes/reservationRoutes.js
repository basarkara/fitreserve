const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

/**
 * Reservation Routes
 * /api/reservations
 * 
 * Tüm reservation route'ları authentication gerektirir
 */

// GET /api/reservations - Kullanıcının rezervasyonlarını listele
router.get('/', authenticate, reservationController.getUserReservations);

// GET /api/reservations/:id - Rezervasyon detayı
router.get('/:id', authenticate, reservationController.getReservationById);

// POST /api/reservations - Yeni rezervasyon yap (Kural 1: Kapasite kontrolü service'de)
router.post('/', authenticate, validate('reservation'), reservationController.createReservation);

// DELETE /api/reservations/:id - Rezervasyon iptal et (Kural 2: 2 saat kontrolü service'de)
router.delete('/:id', authenticate, reservationController.deleteReservation);

module.exports = router;
