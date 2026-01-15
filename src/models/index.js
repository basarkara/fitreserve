const { sequelize } = require('../config/db');
const User = require('./User');
const Course = require('./Course');
const Reservation = require('./Reservation');

// İlişkileri tanımla
// User -> HasMany -> Reservation
User.hasMany(Reservation, {
    foreignKey: 'user_id',
    as: 'reservations',
    onDelete: 'CASCADE'
});

// Reservation -> BelongsTo -> User
Reservation.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// Course -> HasMany -> Reservation
Course.hasMany(Reservation, {
    foreignKey: 'course_id',
    as: 'reservations',
    onDelete: 'CASCADE'
});

// Reservation -> BelongsTo -> Course
Reservation.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
});

module.exports = {
    sequelize,
    User,
    Course,
    Reservation
};
