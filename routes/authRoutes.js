const express = require('express');
const authController = require('../controllers/authController.js');

const router = express.Router();

router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOtpAndFetchUser);


module.exports = router;
