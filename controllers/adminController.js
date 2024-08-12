const { User } = require('../models');

const getAllBeneficiaries = async (req, res) => {
    try {
        const beneficiaries = await User.findAll({ where: { role: 'Beneficiary' } });
        res.json(beneficiaries);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getReports = async (req, res) => {
    try {
        const { weeks } = req.query;
        // Implement logic to fetch reports based on weeks parameter
        res.json({ message: 'Reports fetched successfully.' });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    getAllBeneficiaries,
    getReports,
};
