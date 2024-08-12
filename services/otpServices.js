const axios = require('axios');
const { User } = require('../models');
const config = require('../config/config');

const sendOTP = async (mobileNumber) => {
    const baseUrl = "https://2factor.in/API/V1";
    const token = config.otp.token;
    const templateName = "ENP+FARMS+PVT.+LTD.";
    const apiUrl = `${baseUrl}/${token}/SMS/+91${mobileNumber}/AUTOGEN2/${templateName}`;

    try {
        const response = await axios.get(apiUrl);
        if (response.data.Status === 'Success') {
            return {
                success: true,
                details: response.data.Details,
            };
        } else {
            return {
                success: false,
                message: response.data.Details,
            };
        }
    } catch (error) {
        console.error(`Error sending OTP: ${error.message}`);
        return {
            success: false,
            message: 'Error sending OTP. Please try again.',
        };
    }
};

const verifyOTP = async (sessionId, otpEntered) => {
    const baseUrl = "https://2factor.in/API/V1";
    const token = config.otp.token;
    const apiUrl = `${baseUrl}/${token}/SMS/VERIFY/${sessionId}/${otpEntered}`;

    try {
        const response = await axios.get(apiUrl);
        if (response.data.Status === 'Success') {
            return {
                success: true,
            };
        } else {
            return {
                success: false,
                message: response.data.Details,
            };
        }
    } catch (error) {
        console.error(`Error verifying OTP: ${error.message}`);
        return {
            success: false,
            message: 'Error verifying OTP. Please try again.',
        };
    }
};


module.exports = {
    sendOTP,
    verifyOTP,
};
