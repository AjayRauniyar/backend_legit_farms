const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');


const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).send('No token provided.');
    }

    const token = authHeader.split(' ')[1]; // Extract the token after "Bearer"

    if (!token) {
        return res.status(403).send('Token format is invalid.');
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).send('User not found.');
        }

        req.user = user; // Attach user info to req object
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send('Token expired.');
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(403).send('Invalid token.');
        } else {
            return res.status(500).send('Failed to authenticate token.');
        }
    }
};
module.exports = authMiddleware;
