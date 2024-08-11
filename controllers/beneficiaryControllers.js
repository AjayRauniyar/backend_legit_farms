const { Chicken, Egg, Feed,User } = require('../models');

const getFarmDetails = async (req, res) => {
    try {
        const farmDetails = await Chicken.findAll({ where: { user_id: req.user.id } });
        res.json(farmDetails);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const trackEggProduction = async (req, res) => {
    try {
        const { date, quantity } = req.body;
        const eggProduction = await Egg.create({ user_id: req.user.id, date, quantity });
        res.json(eggProduction);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const trackFeedIntake = async (req, res) => {
    try {
        const { feed_type, feed_date, projected_qty, actual_qty } = req.body;
        const feedIntake = await Feed.create({ user_id: req.user.id, feed_type, feed_date, projected_qty, actual_qty });
        res.json(feedIntake);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
const getUserDetails = async (req, res) => {
    try {
        const { number } = req.query;

        const user = await User.findOne({ where: { number } });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please contact Leggit Farms.' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).send({ error: 'Error fetching user details.' });
    }
};

const updateUserDetails = async (req, res) => {
    try {
        const { number, address, aadhaar, picture } = req.body;

        const user = await User.findOne({ where: { number } });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please contact Leggit Farms.' });
        }

        user.address = address || user.address;
        user.aadhaar = aadhaar || user.aadhaar;
        user.picture = picture || user.picture;

        await user.save();

        res.json(user);
    } catch (error) {
        res.status(500).send({ error: 'Error updating user details.' });
    }
};

module.exports = {
    getFarmDetails,
    trackEggProduction,
    trackFeedIntake,
    getUserDetails,
    updateUserDetails,
};
