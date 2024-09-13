const express = require('express');
const {getCrpDetailsByMobile,updateCrpPictureByMobile,getBeneficiaryDetails,createFeedOrderController,getBeneficiaryFeedDetails} = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route to fetch CRP details by mobile number
router.get('/crp', getCrpDetailsByMobile);

// Route to update CRP picture by mobile number
router.post('/crp/picture', upload.single('picture'), updateCrpPictureByMobile);

//Route to fetch the beneficiary details for User Table
router.get('/crp/beneficiary-details', getBeneficiaryDetails);

//Route to create a new Feed Order by CRP 
router.put('/crp/feed-order', createFeedOrderController);

// Define the route to fetch feed order details by phone number
router.get('/crp/beneficiary-feed-details', getBeneficiaryFeedDetails);

module.exports = router;
