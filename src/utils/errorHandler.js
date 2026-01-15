/**
 * Custom Error sınıfı
 * Uygulama genelinde tutarlı hata yönetimi için kullanılır
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global Error Handler Middleware
 * Tüm hataları yakalar ve tutarlı bir formatta response döner
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Geliştirme ortamında detaylı hata
    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        });
    }

    // Production ortamında sadece gerekli bilgiler
    // Operasyonel hatalar (bilinen hatalar)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message
        });
    }

    // Programatik hatalar (beklenmeyen hatalar)
    console.error('ERROR 💥:', err);
    return res.status(500).json({
        success: false,
        status: 'error',
        message: 'Bir şeyler yanlış gitti!'
    });
};

/**
 * Async fonksiyonları wrap eden yardımcı
 * try-catch bloklarını tekrar etmemek için kullanılır
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = {
    AppError,
    errorHandler,
    catchAsync
};
