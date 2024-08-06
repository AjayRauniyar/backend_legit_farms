const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send('No token provided.');
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = await User.findByPk(decoded.id);
        next();
    } catch (error) {
        res.status(500).send('Failed to authenticate token.');
    }
};

module.exports = authMiddleware;
