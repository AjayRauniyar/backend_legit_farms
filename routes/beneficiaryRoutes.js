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

// Route to get vaccines and medicines for a specific user
router.get('/:userId/vaccines-medicines', beneficiaryController.getVaccinesAndMedicines);

// Route to get audit data (EggAudit, FeedAudit, ChickenAudit) for a specific user
router.get('/:userId/audit-data', beneficiaryController.getAuditData);


router.put('/:userId/chickens', beneficiaryController.updateChickens);
router.put('/:userId/eggs', beneficiaryController.updateEggs);
router.put('/:userId/feed', beneficiaryController.updateFeed);

// Route to create or update vaccine records for a user
router.put('/:userId/vaccines',  beneficiaryController.updateVaccine);
router.put('/:userId/medicines',  beneficiaryController.updateMedicine);

module.exports = router;
