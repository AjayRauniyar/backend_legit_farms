const express = require('express');
const beneficiaryController = require('../controllers/beneficiaryControllers');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

//router.use(authMiddleware);

router.get('/farm', beneficiaryController.getFarmDetails);
router.post('/eggs', beneficiaryController.trackEggProduction);
router.post('/feed', beneficiaryController.trackFeedIntake);
router.get('/user-details', beneficiaryController.getUserDetails);
router.put('/update-user', upload.single('picture'),  beneficiaryController.updateUserDetails);

module.exports = router;
