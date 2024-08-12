const otpService = require('../services/otpServices');

const sendOTP = async (req, res) => {
    const { mobileNumber } = req.body;
    const result = await otpService.sendOTP(mobileNumber);
    if (result.success) {
        res.json({ success: true, sessionId: result.details });
    } else {
        res.status(500).json({ success: false, message: result.message });
    }
};


const verifyOtp = async (req, res) => {
    const { sessionId, otp } = req.body;

    if (!sessionId || !otp) {
        return res.status(400).json({ error: 'Missing required fields: sessionId or otp' });
    }

    const otpResult = await otpService.verifyOTP(sessionId, otp);
    if (otpResult.success) {
        
           return res.json({ success: true });
    } else {
        return res.status(400).json({ success: false, message: otpResult.message });
    }
};

module.exports = {
    sendOTP,
    verifyOtp
};
