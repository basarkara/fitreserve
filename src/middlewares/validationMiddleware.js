const Joi = require('joi');
const { AppError } = require('../utils/errorHandler');

/**
 * Joi şemaları
 */
const schemas = {
    // Kullanıcı kayıt şeması
    register: Joi.object({
        ad_soyad: Joi.string().min(2).max(100).required().messages({
            'string.empty': 'Ad soyad boş olamaz',
            'string.min': 'Ad soyad en az 2 karakter olmalıdır',
            'string.max': 'Ad soyad en fazla 100 karakter olabilir',
            'any.required': 'Ad soyad zorunludur'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Geçerli bir email adresi giriniz',
            'any.required': 'Email zorunludur'
        }),
        sifre: Joi.string().min(6).required().messages({
            'string.min': 'Şifre en az 6 karakter olmalıdır',
            'any.required': 'Şifre zorunludur'
        }),
        role: Joi.string().valid('admin', 'uye').optional()
    }),

    // Kullanıcı giriş şeması
    login: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Geçerli bir email adresi giriniz',
            'any.required': 'Email zorunludur'
        }),
        sifre: Joi.string().required().messages({
            'any.required': 'Şifre zorunludur'
        })
    }),

    // Ders oluşturma şeması
    course: Joi.object({
        ders_adi: Joi.string().min(2).max(100).required().messages({
            'string.empty': 'Ders adı boş olamaz',
            'string.min': 'Ders adı en az 2 karakter olmalıdır',
            'any.required': 'Ders adı zorunludur'
        }),
        egitmen: Joi.string().min(2).max(100).required().messages({
            'string.empty': 'Eğitmen adı boş olamaz',
            'any.required': 'Eğitmen adı zorunludur'
        }),
        tarih_saat: Joi.date().iso().required().messages({
            'date.base': 'Geçerli bir tarih giriniz',
            'any.required': 'Tarih ve saat zorunludur'
        }),
        kontenjan: Joi.number().integer().min(1).required().messages({
            'number.min': 'Kontenjan en az 1 olmalıdır',
            'any.required': 'Kontenjan zorunludur'
        })
    }),

    // Rezervasyon oluşturma şeması
    reservation: Joi.object({
        course_id: Joi.number().integer().required().messages({
            'number.base': 'Geçerli bir ders ID\'si giriniz',
            'any.required': 'Ders ID\'si zorunludur'
        })
    })
};

/**
 * Validasyon middleware factory
 * @param {string} schemaName - Kullanılacak şema adı
 */
const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];

        if (!schema) {
            return next(new AppError(`Şema bulunamadı: ${schemaName}`, 500));
        }

        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Tüm hataları göster
            stripUnknown: true // Tanınmayan alanları kaldır
        });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return next(new AppError(errorMessage, 400));
        }

        // Validated değeri request body'ye ata
        req.body = value;
        next();
    };
};

module.exports = { validate, schemas };
