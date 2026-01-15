const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

/**
 * Course Routes
 * /api/courses
 */

// GET /api/courses - Tüm dersleri listele (Public)
router.get('/', courseController.getAllCourses);

// GET /api/courses/:id - Belirli bir dersi getir (Public)
router.get('/:id', courseController.getCourseById);

// POST /api/courses - Yeni ders ekle (Sadece Admin)
router.post('/', authenticate, isAdmin, validate('course'), courseController.createCourse);

// PUT /api/courses/:id - Dersi güncelle (Sadece Admin)
router.put('/:id', authenticate, isAdmin, courseController.updateCourse);

// DELETE /api/courses/:id - Dersi sil (Sadece Admin)
router.delete('/:id', authenticate, isAdmin, courseController.deleteCourse);

module.exports = router;
