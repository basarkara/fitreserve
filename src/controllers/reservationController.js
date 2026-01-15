const reservationService = require('../services/reservationService');
const { successResponse } = require('../utils/helpers');
const { catchAsync } = require('../utils/errorHandler');

/**
 * Reservation Controller
 * HTTP isteklerini karşılar, iş mantığını service'e devreder
 * 
 * Not: İş kuralları (kapasite kontrolü, zaman kısıtlaması) 
 * reservationService.js içinde uygulanmaktadır
 */

/**
 * Kullanıcının rezervasyonlarını listele
 * GET /api/reservations
 */
const getUserReservations = catchAsync(async (req, res, next) => {
    const reservations = await reservationService.getUserReservations(req.user.id);

    successResponse(res, 200, 'Rezervasyonlarınız', reservations);
});

/**
 * Yeni rezervasyon oluştur
 * POST /api/reservations
 * 
 * İş Kuralı 1: Kapasite kontrolü service'de yapılır
 */
const createReservation = catchAsync(async (req, res, next) => {
    const { course_id } = req.body;

    const reservation = await reservationService.createReservation(req.user.id, course_id);

    successResponse(res, 201, 'Rezervasyon başarıyla oluşturuldu', reservation);
});

/**
 * Rezervasyonu iptal et
 * DELETE /api/reservations/:id
 * 
 * İş Kuralı 2: Zaman kısıtlaması (2 saat kuralı) service'de kontrol edilir
 */
const deleteReservation = catchAsync(async (req, res, next) => {
    await reservationService.deleteReservation(req.params.id, req.user.id);

    successResponse(res, 200, 'Rezervasyon başarıyla iptal edildi');
});

/**
 * Rezervasyon detayını getir
 * GET /api/reservations/:id
 */
const getReservationById = catchAsync(async (req, res, next) => {
    const reservation = await reservationService.getReservationById(req.params.id);

    successResponse(res, 200, 'Rezervasyon detayı', reservation);
});

module.exports = {
    getUserReservations,
    createReservation,
    deleteReservation,
    getReservationById
};
