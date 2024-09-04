const AWS = require('aws-sdk');
const uuid = require('uuid').v4;
const config =require('../config/config')
const {Feed, Chicken, Egg,  User ,Vaccine,EggAudit,ChickenAudit,FeedAudit, Medicine} = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');


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
// Function to get user-related details including chickens, eggs, and feed based on userId    include: [Chicken, Egg, Feed, Vaccine]
const getUserDetailsById = async (req, res) => {
    const userId = req.params.userId;
    try {
            // set the cuurent date and subtract 4 days to define the range of the data output
      
        const user = await User.findByPk(userId, {
            include: [
                { model: Chicken, as: 'Chickens' },
                { model: Egg, as: 'Eggs' },
                { model: Feed, as: 'Feeds' }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getVaccinesAndMedicines = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findByPk(userId, {
            include: [
                { model: Vaccine, as: 'Vaccines' },
                { model: Medicine, as: 'Medicines' }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            vaccines: user.Vaccines,
            medicines: user.Medicines
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getAuditData = async (req, res) => {
    const userId = req.params.userId;
    try {
        const fourDaysAgo = moment().subtract(4, 'days').toDate();

        const user = await User.findByPk(userId, {
            include: [
                { 
                    model: EggAudit, 
                    as: 'EggAudits', 
                    where: {
                        date: {
                            [Op.gte]: fourDaysAgo
                        }
                    },
                    required: false
                },
                { 
                    model: FeedAudit, 
                    as: 'FeedAudits', 
                    where: {
                        feed_date: {
                            [Op.gte]: fourDaysAgo
                        }
                    },
                    required: false
                },
                { 
                    model: ChickenAudit, 
                    as: 'ChickenAudits', 
                    where: {
                        start_date: {
                            [Op.gte]: fourDaysAgo
                        }
                    },
                    required: false
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            eggAudits: user.EggAudits,
            feedAudits: user.FeedAudits,
            chickenAudits: user.ChickenAudits
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




const updateChickens = async (req, res) => {
    const userId = req.params.userId;
    const { start_date, total_count, culling_log, death_disease } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found. Chicken data will not be created.' });
        }

        let chicken = await Chicken.findOne({ where: { user_id: userId } });

        if (!chicken) {
            chicken = await Chicken.create({
                user_id: userId,
                start_date: start_date || new Date(),
                total_count: total_count || 0,
                culling_log: culling_log || 0,
                death_disease: death_disease || 0
            });
        } else {
            chicken.start_date = start_date || chicken.start_date;
            chicken.total_count = total_count !== undefined ? total_count : chicken.total_count;
            chicken.culling_log = culling_log !== undefined ? culling_log : chicken.culling_log;
            chicken.death_disease = death_disease !== undefined ? death_disease : chicken.death_disease;

            await chicken.save();
        }

        res.json(chicken);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the chicken data.' });
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
    const { feed_date, quantity } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found. Feed data will not be created.' });
        }

        let feed = await Feed.findOne({ where: { user_id: userId } });

        if (!feed) {
            // If feed data for the user does not exist, create a new entry
            feed = await Feed.create({
                user_id: userId,
                feed_date: feed_date || new Date(),
                quantity: quantity || 0
            });
        } else {
            // If feed data for the user exists, update the entry
            feed.feed_date = feed_date || feed.feed_date;
            feed.quantity = quantity !== undefined ? quantity : feed.quantity;

            await feed.save();
        }

        res.json(feed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the feed data.' });
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
const updateMedicine = async (req, res) => {
    const userId = req.params.userId;
    const { medicine_name, date } = req.body;

    try {
        // Check if the user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.Medicine data will not be created.' });
        }

        // Check if a vaccine record exists for this user with the same vaccine name
        let medicine = await Medicine.findOne({ where: { user_id: userId, medicine_name: medicine_name } });

        if (!medicine) {
            // Create a new vaccine record if it doesn't exist
            medicine = await Medicine.create({
                user_id: userId,
                medicine_name: medicine_name,
                date: date || new Date()
            });
        } else {
            // Update the existing vaccine record
            medicine.date = date || medicine.date;
            await medicine.save();
        }

        res.json(medicine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




module.exports = {
    getUserDetails,
    updateUserDetails,
    getUserDetailsById,
    getVaccinesAndMedicines,
    getAuditData,
    updateChickens,
    updateEggs,
    updateFeed,
    updateVaccine,
    updateMedicine,
};
