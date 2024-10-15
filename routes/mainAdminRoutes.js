const express = require('express');
const {getAdminDetailsByMobile,getBeneficiaryByNumber,getTotalCountBeneficiary,getAllDateQuantitiesBeneficiary,getUnreceivedFeedOrdersCrp,getTotalCountCrp,getTotalCountSelectedDateBeneficiary,getTotalCountselectedDateCrp} = require('../controllers/mainAdminControllers');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


router.get('/details', getAdminDetailsByMobile);
router.get('/beneficiarynumber',getBeneficiaryByNumber)
router.get('/totalcount', getTotalCountBeneficiary);
router.get('/date-quantities', getAllDateQuantitiesBeneficiary);
router.get('/feed-orders-crp', getUnreceivedFeedOrdersCrp);
router.get('/totalcount-crp', getTotalCountCrp);

router.get('/totalcountdate', getTotalCountSelectedDateBeneficiary);
router.get('/totalcountdate-crp', getTotalCountselectedDateCrp);

module.exports = router;
