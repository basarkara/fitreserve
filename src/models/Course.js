const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ders_adi: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Ders adı boş olamaz'
            }
        }
    },
    egitmen: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Eğitmen adı boş olamaz'
            }
        }
    },
    tarih_saat: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: {
                msg: 'Geçerli bir tarih ve saat giriniz'
            }
        }
    },
    kontenjan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Kontenjan en az 1 olmalıdır'
            }
        }
    },
    mevcut_katilimci: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
}, {
    tableName: 'courses',
    timestamps: true
});

module.exports = Course;
