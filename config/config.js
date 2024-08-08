require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    db: {
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.dialect,
    },
    jwtSecret: process.env.JWT_SECRET,
    otp: {
        token: process.env.OTP_TOKEN,
    },
};
