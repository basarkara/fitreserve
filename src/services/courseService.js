const { Course } = require('../models');
const { AppError } = require('../utils/errorHandler');

/**
 * Course Service
 * Ders CRUD işlemlerinin iş mantığını içerir
 */
class CourseService {
    /**
     * Tüm dersleri listeler
     * @returns {Array} - Ders listesi
     */
    async getAllCourses() {
        const courses = await Course.findAll({
            order: [['tarih_saat', 'ASC']]
        });
        return courses;
    }

    /**
     * Belirli bir dersi ID'ye göre getirir
     * @param {number} courseId - Ders ID'si
     * @returns {Object} - Ders bilgileri
     */
    async getCourseById(courseId) {
        const course = await Course.findByPk(courseId);

        if (!course) {
            throw new AppError('Ders bulunamadı', 404);
        }

        return course;
    }

    /**
     * Yeni ders oluşturur (Sadece admin)
     * @param {Object} courseData - Ders bilgileri
     * @returns {Object} - Oluşturulan ders
     */
    async createCourse(courseData) {
        const { ders_adi, egitmen, tarih_saat, kontenjan } = courseData;

        const course = await Course.create({
            ders_adi,
            egitmen,
            tarih_saat: new Date(tarih_saat),
            kontenjan,
            mevcut_katilimci: 0
        });

        return course;
    }

    /**
     * Dersi günceller (Sadece admin)
     * @param {number} courseId - Ders ID'si
     * @param {Object} courseData - Güncellenecek bilgiler
     * @returns {Object} - Güncellenen ders
     */
    async updateCourse(courseId, courseData) {
        const course = await this.getCourseById(courseId);

        await course.update(courseData);

        return course;
    }

    /**
     * Dersi siler (Sadece admin)
     * @param {number} courseId - Ders ID'si
     */
    async deleteCourse(courseId) {
        const course = await this.getCourseById(courseId);

        await course.destroy();
    }
}

module.exports = new CourseService();
