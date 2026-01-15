const courseService = require('../services/courseService');
const { successResponse } = require('../utils/helpers');
const { catchAsync } = require('../utils/errorHandler');

/**
 * Course Controller
 * HTTP isteklerini karşılar, iş mantığını service'e devreder
 */

/**
 * Tüm dersleri listele
 * GET /api/courses
 */
const getAllCourses = catchAsync(async (req, res, next) => {
    const courses = await courseService.getAllCourses();

    successResponse(res, 200, 'Dersler listelendi', courses);
});

/**
 * Belirli bir dersi getir
 * GET /api/courses/:id
 */
const getCourseById = catchAsync(async (req, res, next) => {
    const course = await courseService.getCourseById(req.params.id);

    successResponse(res, 200, 'Ders detayı', course);
});

/**
 * Yeni ders oluştur (Sadece Admin)
 * POST /api/courses
 */
const createCourse = catchAsync(async (req, res, next) => {
    const course = await courseService.createCourse(req.body);

    successResponse(res, 201, 'Ders başarıyla oluşturuldu', course);
});

/**
 * Dersi güncelle (Sadece Admin)
 * PUT /api/courses/:id
 */
const updateCourse = catchAsync(async (req, res, next) => {
    const course = await courseService.updateCourse(req.params.id, req.body);

    successResponse(res, 200, 'Ders başarıyla güncellendi', course);
});

/**
 * Dersi sil (Sadece Admin)
 * DELETE /api/courses/:id
 */
const deleteCourse = catchAsync(async (req, res, next) => {
    await courseService.deleteCourse(req.params.id);

    successResponse(res, 200, 'Ders başarıyla silindi');
});

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};
