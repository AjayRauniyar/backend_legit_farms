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

    // Verify OTP using the 2factor service
    const otpResult = await otpService.verifyOTP(sessionId, otp);
    if (!otpResult.success) {
        return res.status(400).json({ error: 'Invalid OTP', message: otpResult.message });
    }

    try {
        // Fetch user details from the AWS-hosted database
        const user = await User.findOne({ where: { number: mobileNumber } });
        if (!user) {
            return res.status(404).json({ error: 'User not found. Please contact Leggit Farms.' });
        }

        // Respond with the user data
        res.json({ success: true, user });
    } catch (error) {
        console.error(`Error fetching user: ${error.message}`);
        return res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch user details' });
    }
};

module.exports = {
    sendOTP,
    verifyOtpAndFetchUser,
};
