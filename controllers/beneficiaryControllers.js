const AWS = require('aws-sdk');
const uuid = require('uuid').v4;
const config =require('../config/config')
const {Feed, Chicken, Egg,  User ,Vaccine} = require('../models');


const getUserDetails = async (req, res) => {
    try {
        // Handle mobile number from either query parameters (GET) or JSON body (POST)
        const mobilenumber = req.query.mobilenumber || req.body.mobilenumber;

        if (!mobilenumber) {
            return res.status(400).json({ message: 'Mobile number is required.' });
        }

        const user = await User.findOne({ where: { number: mobilenumber } });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please contact support.' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).send({ error: 'Error fetching user details.' });
    }
};

// Configure AWS SDK
AWS.config.update({
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
    region: config.s3.region,
});

const s3 = new AWS.S3();

const deleteOldImage = async (oldPictureUrl) => {
    if (oldPictureUrl) {
        const urlParts = oldPictureUrl.split('/');
        const bucketName = urlParts[2].split('.')[0];
        const key = urlParts.slice(3).join('/');

        await s3.deleteObject({
            Bucket: bucketName,
            Key: key
        }).promise();
    }
};
const updateUserDetails = async (req, res) => {
    try {
        // Handle mobile number from form-data or JSON body
        const mobilenumber = req.body.mobilenumber; // multer handles text fields from form-data

        if (!mobilenumber) {
            return res.status(400).json({ error: 'Number is required.' });
        }

        // Find the user by their mobile number
        const user = await User.findOne({ where: { number: mobilenumber } });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please contact support.' });
        }

        // Handle the picture update
        let pictureUrl = user.picture;
        if (req.file) { // multer puts the file in req.file
            const pictureKey = `users/${mobilenumber}/${uuid()}.jpg`;

            const uploadParams = {
                Bucket: config.s3.bucketName,
                Key: pictureKey,
                Body: req.file.buffer,
                ContentType: req.file.mimetype // automatically detects the file type
            };

            const s3Response = await s3.upload(uploadParams).promise();

            // Save the new picture URL
            pictureUrl = s3Response.Location;

            // Delete the old picture from S3
            if (user.picture) {
                await deleteOldImage(user.picture);
            }
        } else if (req.body.picture === null) {
            // If picture is explicitly set to null, delete the old image
            await deleteOldImage(user.picture);
            pictureUrl = null;
        }

        // Update user details with the provided values, or keep the existing ones if not provided
        user.address = req.body.address || user.address;
        user.aadhaar = req.body.aadhaar || user.aadhaar;
        user.picture = pictureUrl;

        // Save the updated user details to the database
        await user.save();

        // Return the updated user details as a JSON response
        res.json(user);
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).send({ error: 'Error updating user details.' });
    }
};
// upto here to fetch the user details and update the user details
// below is the code for the getuserdetails for chicken,eggs and feed of the beneficiary user
// Function to get user-related details including chickens, eggs, and feed based on userId
const getUserDetailsById = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findByPk(userId, {
            include: [Chicken, Egg, Feed, Vaccine]
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateChickens = async (req, res) => {
    const userId = req.params.userId;
    const { start_date, male_count, female_count, culling_log } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found. Default chicken data will not be created.' });
        }

        let chicken = await Chicken.findOne({ where: { user_id: userId } });

        if (!chicken) {
            chicken = await Chicken.create({
                user_id: userId,
                start_date: start_date || new Date(),
                male_count: male_count || 0,
                female_count: female_count || 0,
                culling_log: culling_log || ''
            });
        } else {
            chicken.start_date = start_date || chicken.start_date;
            chicken.male_count = male_count || chicken.male_count;
            chicken.female_count = female_count || chicken.female_count;
            chicken.culling_log = culling_log || chicken.culling_log;

            await chicken.save();
        }

        res.json(chicken);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const updateEggs = async (req, res) => {
    const userId = req.params.userId;
    const { date, quantity } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found. Default egg data will not be created.' });
        }

        let egg = await Egg.findOne({ where: { user_id: userId } });

        if (!egg) {
            egg = await Egg.create({
                user_id: userId,
                date: date || new Date(),
                quantity: quantity || 0
            });
        } else {
            egg.date = date || egg.date;
            egg.quantity = quantity || egg.quantity;

            await egg.save();
        }

        res.json(egg);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateFeed = async (req, res) => {
    const userId = req.params.userId;
    const { feed_type, feed_date, projected_qty, actual_qty } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found. Default feed data will not be created.' });
        }

        let feed = await Feed.findOne({ where: { user_id: userId } });

        if (!feed) {
            feed = await Feed.create({
                user_id: userId,
                feed_type: feed_type || 'Unknown',
                feed_date: feed_date || new Date(),
                projected_qty: projected_qty || 0,
                actual_qty: actual_qty || 0
            });
        } else {
            feed.feed_type = feed_type || feed.feed_type;
            feed.feed_date = feed_date || feed.feed_date;
            feed.projected_qty = projected_qty || feed.projected_qty;
            feed.actual_qty = actual_qty || feed.actual_qty;

            await feed.save();
        }

        res.json(feed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to create or update vaccine details for a user
const updateVaccine = async (req, res) => {
    const userId = req.params.userId;
    const { vaccine_name, date } = req.body;

    try {
        // Check if the user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found. Vaccine data will not be created.' });
        }

        // Check if a vaccine record exists for this user with the same vaccine name
        let vaccine = await Vaccine.findOne({ where: { user_id: userId, vaccine_name: vaccine_name } });

        if (!vaccine) {
            // Create a new vaccine record if it doesn't exist
            vaccine = await Vaccine.create({
                user_id: userId,
                vaccine_name: vaccine_name,
                date: date || new Date()
            });
        } else {
            // Update the existing vaccine record
            vaccine.date = date || vaccine.date;
            await vaccine.save();
        }

        res.json(vaccine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = {
    getUserDetails,
    updateUserDetails,
    getUserDetailsById,
    updateChickens,
    updateEggs,
    updateFeed,
    updateVaccine
};
