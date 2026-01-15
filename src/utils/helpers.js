/**
 * Başarılı response formatı
 */
const successResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Tarih formatını kontrol eder
 */
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

/**
 * İki tarih arasındaki saat farkını hesaplar
 */
const getHoursDifference = (date1, date2) => {
    const diffInMs = Math.abs(new Date(date1) - new Date(date2));
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return diffInHours;
};

module.exports = {
    successResponse,
    isValidDate,
    getHoursDifference
};
