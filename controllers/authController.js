// const otpService = require('../services/otpServices');

// const sendOTP = async (req, res) => {
//     const { mobileNumber } = req.body;
//     const result = await otpService.sendOTP(mobileNumber);
//     if (result.success) {
//         res.json({ success: true, sessionId: result.details });
//     } else {
//         res.status(500).json({ success: false, message: result.message });
//     }
// };

// const verifyOTP = async (req, res) => {
//     const { sessionId, otp } = req.body;
//     const result = await otpService.verifyOTP(sessionId, otp);
//     if (result.success) {
//         res.json({ success: true });
//     } else {
//         res.status(500).json({ success: false, message: result.message });
//     }
// };

// module.exports = {
//     sendOTP,
//     verifyOTP,
// };

const otpService = require('../services/otpServices');

const sendOTP = async (req, res) => {
    console.log('sendOTP request received:', req.body);
    const { mobileNumber } = req.body;
    const result = await otpService.sendOTP(mobileNumber);
    if (result.success) {
        res.json({ success: true, sessionId: result.details });
    } else {
        res.status(500).json({ success: false, message: result.message });
    }
};

const verifyOTP = async (req, res) => {
    console.log('verifyOTP request received:', req.body);
    const { sessionId, otp } = req.body;
    const result = await otpService.verifyOTP(sessionId, otp);
    if (result.success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: result.message });
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
};

