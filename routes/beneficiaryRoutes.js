const express = require('express');
const beneficiaryController = require('../controllers/beneficiaryControllers');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

//router.use(authMiddleware);

router.get('/user-details', beneficiaryController.getUserDetails);
router.put('/update-user', upload.single('picture'),  beneficiaryController.updateUserDetails);

router.get('/:userId', beneficiaryController.getUserDetailsById);
router.put('/:userId/chickens', beneficiaryController.updateChickens);
router.put('/:userId/eggs', beneficiaryController.updateEggs);
router.put('/:userId/feed', beneficiaryController.updateFeed);

module.exports = router;
