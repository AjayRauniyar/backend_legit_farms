const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/beneficiaries', adminController.getAllBeneficiaries);
router.get('/reports', adminController.getReports);

module.exports = router;
