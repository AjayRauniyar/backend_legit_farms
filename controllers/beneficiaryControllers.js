const { Chicken, Egg, Feed } = require('../models');

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

module.exports = {
    getFarmDetails,
    trackEggProduction,
    trackFeedIntake,
};
