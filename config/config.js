require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    db: {
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DIALECT,
    },
    jwtSecret: process.env.JWT_SECRET,
    otp: {
        token: process.env.OTP_TOKEN,
    },
    s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        bucketName: process.env.S3_BUCKET_NAME,
    }
};
