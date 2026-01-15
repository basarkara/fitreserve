const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const courseRoutes = require('./courseRoutes');
const reservationRoutes = require('./reservationRoutes');

/**
 * Ana Route Index
 * Tüm route'ları birleştirir
 */

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/reservations', reservationRoutes);

// API Health Check
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'FitReserve API çalışıyor',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
