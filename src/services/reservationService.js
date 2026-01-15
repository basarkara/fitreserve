const { sequelize, Reservation, Course, User } = require('../models');
const { AppError } = require('../utils/errorHandler');
const { getHoursDifference } = require('../utils/helpers');

/**
 * Reservation Service
 * Rezervasyon işlemlerinin iş mantığını içerir
 * 
 * ÖNEMLİ İŞ KURALLARI:
 * 1. Kapasite Kontrolü: Kontenjan doluysa rezervasyon yapılamaz
 * 2. Zaman Kısıtlaması: Dersin başlamasına 2 saatten az kaldıysa iptal edilemez
 */
class ReservationService {
    /**
     * Kullanıcının tüm rezervasyonlarını listeler
     * @param {number} userId - Kullanıcı ID'si
     * @returns {Array} - Rezervasyon listesi
     */
    async getUserReservations(userId) {
        const reservations = await Reservation.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'ders_adi', 'egitmen', 'tarih_saat', 'kontenjan', 'mevcut_katilimci']
                }
            ],
            order: [['kayit_tarihi', 'DESC']]
        });

        return reservations;
    }

    /**
     * Yeni rezervasyon oluşturur
     * 
     * KURAL 1 - KAPASİTE KONTROLÜ:
     * - Kurs kontenjanını kontrol et
     * - mevcut_katilimci >= kontenjan ise hata fırlat
     * - Transaction ile rezervasyon oluştur ve mevcut_katilimci'yı artır
     * 
     * @param {number} userId - Kullanıcı ID'si
     * @param {number} courseId - Ders ID'si
     * @returns {Object} - Oluşturulan rezervasyon
     */
    async createReservation(userId, courseId) {
        // Transaction başlat - veri tutarlılığı için kritik
        const transaction = await sequelize.transaction();

        try {
            // Kursu kilitle ve getir (race condition önleme)
            const course = await Course.findByPk(courseId, {
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            if (!course) {
                throw new AppError('Ders bulunamadı', 404);
            }

            // KURAL 1: Kapasite kontrolü
            if (course.mevcut_katilimci >= course.kontenjan) {
                throw new AppError('Bu ders için kontenjan dolmuştur', 400);
            }

            // Kullanıcının bu derse daha önce kayıt olup olmadığını kontrol et
            const existingReservation = await Reservation.findOne({
                where: { user_id: userId, course_id: courseId },
                transaction
            });

            if (existingReservation) {
                throw new AppError('Bu derse zaten kayıtlısınız', 400);
            }

            // Rezervasyonu oluştur
            const reservation = await Reservation.create({
                user_id: userId,
                course_id: courseId,
                kayit_tarihi: new Date()
            }, { transaction });

            // Mevcut katılımcı sayısını artır
            await course.update({
                mevcut_katilimci: course.mevcut_katilimci + 1
            }, { transaction });

            // Transaction'ı commit et
            await transaction.commit();

            // Rezervasyonu ders bilgileriyle birlikte getir
            const reservationWithCourse = await Reservation.findByPk(reservation.id, {
                include: [
                    {
                        model: Course,
                        as: 'course',
                        attributes: ['id', 'ders_adi', 'egitmen', 'tarih_saat', 'kontenjan', 'mevcut_katilimci']
                    }
                ]
            });

            return reservationWithCourse;

        } catch (error) {
            // Hata durumunda rollback
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Rezervasyonu iptal eder
     * 
     * KURAL 2 - ZAMAN KISITLAMASI:
     * - Dersin tarih_saat'ini kontrol et
     * - Dersin başlamasına 2 saatten az kaldıysa iptal izni yok
     * - Transaction ile rezervasyonu sil ve mevcut_katilimci'yı azalt
     * 
     * @param {number} reservationId - Rezervasyon ID'si
     * @param {number} userId - Kullanıcı ID'si
     */
    async deleteReservation(reservationId, userId) {
        // Transaction başlat
        const transaction = await sequelize.transaction();

        try {
            // Rezervasyonu bul
            const reservation = await Reservation.findOne({
                where: { id: reservationId, user_id: userId },
                include: [
                    {
                        model: Course,
                        as: 'course'
                    }
                ],
                transaction
            });

            if (!reservation) {
                throw new AppError('Rezervasyon bulunamadı veya size ait değil', 404);
            }

            // KURAL 2: Zaman kısıtlaması kontrolü
            const now = new Date();
            const courseStartTime = new Date(reservation.course.tarih_saat);
            const hoursUntilCourse = getHoursDifference(courseStartTime, now);

            // Dersin geçmişte olup olmadığını kontrol et
            if (courseStartTime < now) {
                throw new AppError('Geçmiş derslerin rezervasyonu iptal edilemez', 400);
            }

            // 2 saatten az kaldıysa iptal izni yok
            if (hoursUntilCourse < 2) {
                throw new AppError(
                    `Dersin başlamasına 2 saatten az kaldığı için rezervasyon iptal edilemez. Kalan süre: ${hoursUntilCourse.toFixed(1)} saat`,
                    400
                );
            }

            // Kursu kilitle ve getir
            const course = await Course.findByPk(reservation.course_id, {
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            // Rezervasyonu sil
            await reservation.destroy({ transaction });

            // Mevcut katılımcı sayısını azalt
            await course.update({
                mevcut_katilimci: Math.max(0, course.mevcut_katilimci - 1)
            }, { transaction });

            // Transaction'ı commit et
            await transaction.commit();

        } catch (error) {
            // Hata durumunda rollback
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Rezervasyon ID'sine göre rezervasyonu getirir
     * @param {number} reservationId - Rezervasyon ID'si
     * @returns {Object} - Rezervasyon bilgileri
     */
    async getReservationById(reservationId) {
        const reservation = await Reservation.findByPk(reservationId, {
            include: [
                {
                    model: Course,
                    as: 'course'
                },
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['sifre'] }
                }
            ]
        });

        if (!reservation) {
            throw new AppError('Rezervasyon bulunamadı', 404);
        }

        return reservation;
    }
}

module.exports = new ReservationService();
