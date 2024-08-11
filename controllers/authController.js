const otpService = require('../services/otpServices');
const { User } = require('../models');

const sendOTP = async (req, res) => {
    const { mobileNumber } = req.body;
    const result = await otpService.sendOTP(mobileNumber);
    if (result.success) {
        res.json({ success: true, sessionId: result.details });
    } else {
        res.status(500).json({ success: false, message: result.message });
    }
};

const verifyOtpAndFetchUser = async (req, res) => {
    const { sessionId, otp, mobileNumber } = req.body;

    const result = await otpService.verifyOTP(sessionId, otp);
    if (!result.success) {
        return res.status(400).json({ error: 'Invalid OTP', message: result.message });
    }

    // Fetch user details from the database
    const user = await User.findOne({ where: { number: mobileNumber } });
    if (!user) {
        return res.status(404).json({ error: 'User not found. Please contact Leggit Farms.' });
    }

    res.json(user);
};

module.exports = {
    sendOTP,
    verifyOtpAndFetchUser,
};
