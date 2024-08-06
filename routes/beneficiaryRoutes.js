const express = require('express');
const beneficiaryController = require('../controllers/beneficiaryControllers');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/farm', beneficiaryController.getFarmDetails);
router.post('/eggs', beneficiaryController.trackEggProduction);
router.post('/feed', beneficiaryController.trackFeedIntake);

module.exports = router;
