const AWS = require('aws-sdk');
const uuid = require('uuid').v4;
const config = require('../config/config');
const { Crptable ,User,Chicken,FeedOrder,EggOrder,CrpFeedOrder} = require('../models'); // Assuming CrpTable is defined in models
const { Op } = require('sequelize');

// AWS S3 Configuration
AWS.config.update({
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
    region: config.s3.region,
});

const s3 = new AWS.S3();

// Function to update feed quantity by crp_id
const updateCrpFeedQuantity = async (req, res) => {
    const { crp_id, feedquantity } = req.body; // Expecting crp_id and feedQuantity in the request body

    // Validate inputs
    if (!crp_id || typeof feedquantity !== 'number') {
        return res.status(400).json({ error: 'crp_id is required and feedQuantity must be a number.' });
    }

    try {
        // Find the record by crp_id
        const order = await Crptable.findOne({ where: { crp_id } });

        // Check if the record exists
        if (!order) {
            return res.status(404).json({ error: 'Feed order not found for the given crp_id.' });
        }

        // Update the feedQuantity
        order.feedquantity = feedquantity; // Set new value

        // Save the updated order
        await order.save();

        // Respond with the updated order
        return res.status(200).json({ message: 'Feed quantity updated successfully.', order });
    } catch (error) {
        console.error('Error updating feed quantity:', error);
        return res.status(500).json({ error: 'An error occurred while updating the feed quantity.' });
    }
};

// Function to fetch CRP details by mobile number
const getCrpDetailsByMobile = async (req, res) => {
    try {
        const mobilenumber = req.query.mobilenumber || req.body.mobilenumber;

        if (!mobilenumber) {
            return res.status(400).json({ message: 'Mobile number is required.' });
        }

        const crp = await Crptable.findOne({ where: { phone_number: mobilenumber } });

        if (!crp) {
            return res.status(404).json({ message: 'CRP not found. Please contact support.' });
        }

        res.json(crp);
    } catch (error) {
        console.error('Error fetching CRP details:', error);
        res.status(500).json({ error: 'Error fetching CRP details.' });
    }
};

// Helper function to delete an old image from S3
const deleteOldImage = async (oldPictureUrl) => {
    if (oldPictureUrl) {
        const urlParts = oldPictureUrl.split('/');
        const bucketName = urlParts[2].split('.')[0]; // Extract the bucket name
        const key = urlParts.slice(3).join('/'); // Extract the object key

        await s3.deleteObject({
            Bucket: bucketName,
            Key: key,
        }).promise();
    }
};

// Function to update CRP picture based on mobile number
const updateCrpPictureByMobile = async (req, res) => {
    try {
        const mobilenumber = req.query.mobilenumber || req.body.mobilenumber; // Get the mobile number from the request body

        if (!mobilenumber) {
            return res.status(400).json({ error: 'Mobile number is required.' });
        }

        // Find the CRP by their mobile number
        const crp = await Crptable.findOne({ where: { phone_number: mobilenumber } });

        if (!crp) {
            return res.status(404).json({ message: 'CRP not found. Please contact support.' });
        }

        // Handle the picture update
        let pictureUrl = crp.picture;
        if (req.file) { // multer adds file details to req.file
            const pictureKey = `crp/${mobilenumber}/${uuid()}.jpg`;

            // Upload to S3
            const uploadParams = {
                Bucket: config.s3.bucketName,
                Key: pictureKey,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            };

            const s3Response = await s3.upload(uploadParams).promise();

            // Save the new picture URL
            pictureUrl = s3Response.Location;

            // Delete the old picture from S3 if it exists
            if (crp.picture) {
                await deleteOldImage(crp.picture);
            }
        } else if (req.body.picture === null) {
            // If picture is explicitly set to null, delete the old image
            await deleteOldImage(crp.picture);
            pictureUrl = null;
        }

        // Update the CRP's picture in the database
        crp.picture = pictureUrl;

        // Save the updated CRP data
        await crp.save();

        // Return the updated CRP information
        res.json(crp);
    } catch (error) {
        console.error('Error updating CRP picture:', error);
        res.status(500).json({ error: 'Error updating CRP picture.' });
    }
};


// to fetch the information of beneficiary in through crp
const getBeneficiaryDetails = async (req, res) => {
    try {
        // Get mobile number from query parameters (GET) or request body (POST)
        const mobilenumber = req.query.mobilenumber || req.body.mobilenumber;

        if (!mobilenumber) {
            return res.status(400).json({ message: 'Mobile number is required.' });
        }

        // Fetch user details (selecting only id, name, number, and village)
        const user = await User.findOne({
            where: { number: mobilenumber },
            attributes: ['id', 'name', 'number', 'village'],  // Only fetch specific fields
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found. Please contact support.' });
        }

        // Fetch total chickens for the user by summing the 'total_count' column
        const totalChickens = await Chicken.sum('total_count', { where: { user_id: user.id } });

        // Respond with both user details and total chickens
        return res.json({
            id: user.id,
            name: user.name,
            number: user.number,
            village: user.village,
            totalChickens: totalChickens || 0  // Default to 0 if no chickens found
        });

    } catch (error) {
        console.error('Error fetching user details:', error);
        return res.status(500).json({ error: 'Error fetching user details.' });
    }
};
const createCrpFeedOrderController = async (req, res) => {
    try {
        // Extract data from the request body or query parameters
        const crpId = req.body.crp_id || req.query.crp_id;
        const phoneNumber = req.body.phone_number || req.query.phone_number;
        const feedOrderDate = req.body.feed_order_date || new Date(); // Default to current date if not provided
        const feedDeliveryDate = req.body.feed_delivery_date || null;
        const feedReceivedDate = req.body.feed_received_date || null;
        const received = req.body.received || req.query.received || false; // Default to false if not provided
        const feedQuantity = req.body.feedquantity || req.query.feedquantity;

        // Validate that the required data is provided
        if (!crpId || !phoneNumber || !feedOrderDate) {
            return res.status(400).json({ message: 'crp_id, phone_number, and feed_order_date are required.' });
        }

        // Create a new CrpFeedOrder
        const crpFeedOrder = await CrpFeedOrder.create({
            crp_id: crpId,
            phone_number: phoneNumber,
            feed_order_date: feedOrderDate, // Current date if not provided
            feed_delivery_date: feedDeliveryDate,
            feed_received_date: feedReceivedDate,
            received: received ,// Default value
            feedquantity: feedQuantity
        });

        // Send the created CrpFeedOrder back as the response
        return res.status(201).json({
            crpFeedOrder: crpFeedOrder
        });

    } catch (error) {
        console.error('Error creating Crp Feed Order:', error);
        return res.status(500).json({ error: 'Failed to create Crp Feed Order.' });
    }
};


const createFeedOrderController = async (req, res) => {
    try {
        // Extract data from the request body or query parameters
        const crpId = req.body.crp_id || req.query.crp_id;
        const beneficiaryPhoneNumber = req.body.beneficiary_phone_number || req.query.beneficiary_phone_number;
        const quantity = req.body.quantity || req.query.quantity;
        const received = req.body.received || req.query.received || false; // Default to false if not provided
        const delivered = req.body.delivered || req.query.delivered || false; // Default to false if not provided


        // Validate that the required data is provided
        if (!crpId || !beneficiaryPhoneNumber || !quantity) {
            return res.status(400).json({ message: 'crp_id, beneficiary_phone_number, and quantity are required.' });
        }
        //set the current timestamp for recieved_date or delivery_date  
     
        // Create a new feed order
        const feedOrder = await FeedOrder.create({
            crp_id: crpId,
            date: new Date(), // Current date
            beneficiary_phone_number: beneficiaryPhoneNumber,
            quantity: quantity,
            received: received,  // Default value
            delivered: delivered  // Default value
        });

        // Send the created feed order back as the response
        return res.status(201).json({
         
            feedOrder: feedOrder
        });

    } catch (error) {
        console.error('Error creating feed order:', error);
        return res.status(500).json({ error: 'Failed to create feed order.' });
    }
};

const createEggOrderController = async (req, res) => {
    try {
        // Extract data from the request body or query parameters
        const crpId = req.body.crp_id || req.query.crp_id;
        const beneficiaryPhoneNumber = req.body.beneficiary_phone_number || req.query.beneficiary_phone_number;
        const quantity = req.body.quantity || req.query.quantity;
        const received = req.body.received || req.query.received || false; // Default to false if not provided
        const delivered = req.body.delivered || req.query.delivered || false; // Default to false if not provided


        // Validate that the required data is provided
        if (!crpId || !beneficiaryPhoneNumber || !quantity) {
            return res.status(400).json({ message: 'crp_id, beneficiary_phone_number, and quantity are required.' });
        }
        //set the current timestamp for recieved_date or delivery_date  
     
        // Create a new feed order
        const eggOrder = await EggOrder.create({
            crp_id: crpId,
            date: new Date(), // Current date
            beneficiary_phone_number: beneficiaryPhoneNumber,
            quantity: quantity,
            received: received,  // Default value
            delivered: delivered  // Default value
        });

        // Send the created feed order back as the response
        return res.status(201).json({
         
            eggOrder: eggOrder
        });

    } catch (error) {
        console.error('Error creating egg order:', error);
        return res.status(500).json({ error: 'Failed to create egg order.' });
    }
};

const getBeneficiaryFeedDetails = async (req, res) => {
    try {
        // Get phone number and date from query parameters or request body
        const phoneNumber = req.query.beneficiary_phone_number || req.body.beneficiary_phone_number;
        const date = req.query.date || req.body.date;

        // Validate that the phone number is provided
        if (!phoneNumber) {
            return res.status(400).json({ message: 'Beneficiary phone number is required.' });
        }

        // Create the query filter
        const queryFilter = { beneficiary_phone_number: phoneNumber };

        // If a date is provided, add it to the query filter
        if (date) {
            queryFilter.date = date;
        }

        // Fetch feed orders for the given phone number and (optionally) date
        const feedOrders = await FeedOrder.findAll({
            where: queryFilter
        });

        // If no orders found, return a 404
        if (!feedOrders || feedOrders.length === 0) {
            return res.status(404).json({ message: 'No feed orders found for this phone number and date.' });
        }

        // Return the list of feed orders as the response
        return res.json({
            message: 'Feed orders retrieved successfully',
            feedOrders: feedOrders
        });
    } catch (error) {
        console.error('Error fetching feed orders:', error);
        return res.status(500).json({ error: 'Error fetching feed orders.' });
    }
};
module.exports = {
    updateCrpFeedQuantity,
    getCrpDetailsByMobile,
    createCrpFeedOrderController,
    updateCrpPictureByMobile,
    getBeneficiaryDetails,
    createFeedOrderController,
    createEggOrderController,
    getBeneficiaryFeedDetails
};
