const AWS = require('aws-sdk');
const uuid = require('uuid').v4;
const config =require('../config/config')
const { Chicken, Egg, Feed, User } = require('../models');

const getFarmDetails = async (req, res) => {
    try {
        const farmDetails = await Chicken.findAll({ where: { user_id: req.user.id } });
        res.json(farmDetails);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const trackEggProduction = async (req, res) => {
    try {
        const { date, quantity } = req.body;
        const eggProduction = await Egg.create({ user_id: req.user.id, date, quantity });
        res.json(eggProduction);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const trackFeedIntake = async (req, res) => {
    try {
        const { feed_type, feed_date, projected_qty, actual_qty } = req.body;
        const feedIntake = await Feed.create({ user_id: req.user.id, feed_type, feed_date, projected_qty, actual_qty });
        res.json(feedIntake);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

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



module.exports = {
    getFarmDetails,
    trackEggProduction,
    trackFeedIntake,
    getUserDetails,
    updateUserDetails,
};
