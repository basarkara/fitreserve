const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ad_soyad: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Ad soyad boş olamaz'
            }
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            msg: 'Bu email adresi zaten kayıtlı'
        },
        validate: {
            isEmail: {
                msg: 'Geçerli bir email adresi giriniz'
            }
        }
    },
    sifre: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'uye'),
        defaultValue: 'uye',
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: true
});

module.exports = User;
