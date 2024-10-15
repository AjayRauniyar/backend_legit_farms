const { sequelize,AdminTable,Chicken,EggAudit,FeedAudit,Egg,Feed,CrpFeedOrder, Crptable,EggOrder,FeedOrder, ChickenAudit,User} = require('../models'); // Assuming CrpTable is defined in models
const moment = require('moment');
const { Op } = require('sequelize');

const getAdminDetailsByMobile = async (req, res) => {
    try {
        const mobilenumber = req.query.mobilenumber || req.body.mobilenumber;

        if (!mobilenumber) {
            return res.status(400).json({ message: 'Mobile number is required.' });
        }

        const admin = await AdminTable.findOne({ where: { phone_number: mobilenumber } });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found. Please contact support.' });
        }

        res.json(admin);
    } catch (error) {
        console.error('Error fetching Admin details:', error);
        res.status(500).json({ error: 'Error fetching Admin details.' });
    }
};
// Function to find a user by their number
const getBeneficiaryByNumber = async (req,res) => {
    try {
        const number = req.query.number || req.body.number;

        // Ensure number is provided
        if (!number) {
            return res.status(400).json({ message: "Missing required query parameter: number" });
        }
        // Find user by number
        const user = await User.findOne({
            where: {
                number: number, // Search condition
            },
            attributes: ['name', 'number'], // Only return name and number
        });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "Beneficiary not found" });
        }

        res.json(user);// Return the user object
    } catch (error) {
        console.error('Error fetching user by number:', error);
        res.status(500).json({ error: 'Error fetching beneficiary details.' });
    }
};
const getTotalCountBeneficiary = async (req, res) => {

    try {
        // Get today's date in the format 'YYYY-MM-DD'
        const today = moment().startOf('day').toDate();

        // Calculate the sum of total_count for today
        const chickentotal = await Chicken.sum('total_count');

    // Sum the quantity for today's latest Egg entries
        const eggTotal = await EggAudit.sum('quantity', {
            where: {
                updated_at: {
                    [Op.in]: sequelize.literal(`(
                        SELECT MAX(updated_at)
                        FROM eggs_audit
                        WHERE date >= '${moment(today).toISOString()}'
                        AND date < '${moment(today).add(1, 'days').toISOString()}'
                        GROUP BY user_id
                    )`)
                }
            }
        });

        // Sum the quantity for today's latest Feed entries
        const feedTotal = await FeedAudit.sum('quantity', {
            where: {
                updated_at: {
                    [Op.in]: sequelize.literal(`(
                        SELECT MAX(updated_at)
                        FROM feed_audit
                        WHERE feed_date >= '${moment(today).toISOString()}'
                        AND feed_date < '${moment(today).add(1, 'days').toISOString()}'
                        GROUP BY user_id
                    )`)
                }
            }
        });
        // Return the results, defaulting to 0 if no entries are found
        res.json({chicken_quantity: chickentotal || 0,
            egg_quantity: eggTotal || 0,
            feed_quantity: feedTotal || 0
        });
    } catch (error) {
        console.error('Error fetching current date quantities:', error);
        res.status(500).json({ error: 'An error occurred while fetching the quantities for the current date.' });
    }
};


const getAllDateQuantitiesBeneficiary = async (req, res) => {
    try {
        const startDate = moment().startOf('month').toDate(); // Example: start of the current month
        const endDate = moment().endOf('month').toDate();

        // Calculate sums grouped by date for Chicken
        const chickenTotals = await Chicken.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('start_date')), 'date'], // Group by date
                [sequelize.fn('SUM', sequelize.col('total_count')), 'total_count']
            ],
            group: ['date'],
            subQuery:false,
        });

        const eggTotals = await EggAudit.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('updated_at')), 'date'],
                'user_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'quantity']
            ],
            // where: {
            //     updated_at: {
            //         [Op.gte]: startDate,
            //         [Op.lte]: endDate
            //     }
            // },
            group: [sequelize.fn('DATE', sequelize.col('updated_at')), 'user_id'],
            subQuery:false,
        });

       // Step 3: Fetch the latest updated_at for each user per date for FeedAudit
       const feedTotals = await FeedAudit.findAll({
        attributes: [
            [sequelize.fn('DATE', sequelize.col('updated_at')), 'feed_date'],
            'user_id',
            [sequelize.fn('SUM', sequelize.col('quantity')), 'quantity']
        ],
        // where: {
        //     updated_at: {
        //         [Op.gte]: startDate,
        //         [Op.lte]: endDate
        //     }
        // },
        group: [sequelize.fn('DATE', sequelize.col('updated_at')), 'user_id'],
        subQuery:false,
    });
        // Combine results into a single response
        const result = {};

        // Process chicken totals
        chickenTotals.forEach(row => {
            const date = row.date; // This should be defined
            if (date) {
                result[date] = {
                    chicken_quantity: row.total_count || 0,
                    egg_quantity: 0,
                    feed_quantity: 0
                };
            } else {
                console.warn("Encountered undefined date in chickenTotals", row); // Debugging log
            }
        });

        // Process egg totals
        eggTotals.forEach(row => {
            if (!result[row.date]) {
                result[row.date] = {
                    chicken_quantity: 0,
                    egg_quantity: row.quantity || 0,
                    feed_quantity: 0
                };
            } else {
                result[row.date].egg_quantity = row.quantity || 0;
            }
        });

        // Process feed totals
        feedTotals.forEach(row => {
            if (!result[row.date]) {
                result[row.date] = {
                    chicken_quantity: 0,
                    egg_quantity: 0,
                    feed_quantity: row.quantity || 0
                };
            } else {
                result[row.date].feed_quantity = row.quantity || 0;
            }
        });

        // Convert the result object into an array
        const response = Object.entries(result).map(([date, quantities]) => ({
            date,
            ...quantities
        }));

        // Return the results
        res.json(response);
    } catch (error) {
        console.error('Error fetching quantities by date:', error);
        res.status(500).json({ error: 'An error occurred while fetching the quantities by date.' });
    }
};

// Define the controller function to get unreceived feed orders
const getUnreceivedFeedOrdersCrp = async (req, res) => {
    try {
        const unreceivedOrders = await CrpFeedOrder.findAll({
            where: {
                received: false // Fetch orders where feed has not been received
            },
            include: [
                {
                    model: Crptable, // Join with Crptable model
                    attributes: ['crp_name'] // Select only the crp_name from Crptable
                }
            ],
            attributes: ['order_id', 'phone_number', 'feed_order_date', 'feed_delivery_date', 'feedquantity', 'received'], // Select specific columns
            order: [['feed_order_date', 'DESC']] 
        });

        return res.status(200).json({
            
            data: unreceivedOrders
        });
    } catch (error) {
        console.error("Error fetching unreceived feed orders:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching unreceived feed orders."
        });
    }
};



const getTotalCountCrp = async (req, res) => {

    try {

         // Get today's date in the format 'YYYY-MM-DD'
         const today = moment().startOf('day').toDate();
      
        // Sum the quantity for Eggs for the current date
        const eggTotal = await EggOrder.sum('quantity', {
            where: {
                date: {
                    [Op.gte]: today, // Greater than or equal to today's date
                    [Op.lt]: moment(today).add(1, 'days').toDate() // Less than the next day
                }
            }
        });

        // Sum the quantity for Feeds for the current date
        const feedTotal = await FeedOrder.sum('quantity', {
            where: {
                date: {
                    [Op.gte]: today, // Greater than or equal to today's date
                    [Op.lt]: moment(today).add(1, 'days').toDate() // Less than the next day
                }
            }
        });

        // Return the results, defaulting to 0 if no entries are found
        res.json({
            egg_quantity_crp: eggTotal || 0,
            feed_quantity_crp: feedTotal || 0
        });
    } catch (error) {
        console.error('Error fetching current date quantities of crp:', error);
        res.status(500).json({ error: 'An error occurred while fetching the quantities for the current date of crp.' });
    }
};

const getTotalCountSelectedDateBeneficiary = async (req, res) => {
    try {
         // Get selected date from query parameters, default to today if not provided
         const selectedDate = req.query.date ? moment(req.query.date).startOf('day').toDate() : moment().startOf('day').toDate();
        
       // Directly sum the total_count for the latest submission of each user on the selected date
       const chickentotal = await ChickenAudit.sum('total_count', {
        where: {
            updated_at: {
                [Op.in]: sequelize.literal(`(
                    SELECT MAX(updated_at)
                    FROM chicken_audit
                    WHERE updated_at >= '${moment(selectedDate).toISOString()}' 
                    AND updated_at < '${moment(selectedDate).add(1, 'days').toISOString()}'
                    GROUP BY user_id
                )`)
            }
        }
    });
   // Directly sum the quantity for the latest Egg entries for the selected date
   const eggTotal = await EggAudit.sum('quantity', {
    where: {
        updated_at: {
            [Op.in]: sequelize.literal(`(
                SELECT MAX(updated_at)
                FROM eggs_audit
                WHERE date >= '${moment(selectedDate).toISOString()}'
                AND date < '${moment(selectedDate).add(1, 'days').toISOString()}'
                GROUP BY user_id
            )`)
        }
    }
});

// Directly sum the quantity for the latest Feed entries for the selected date
const feedTotal = await FeedAudit.sum('quantity', {
    where: {
        updated_at: {
            [Op.in]: sequelize.literal(`(
                SELECT MAX(updated_at)
                FROM feed_audit
                WHERE feed_date >= '${moment(selectedDate).toISOString()}'
                AND feed_date < '${moment(selectedDate).add(1, 'days').toISOString()}'
                GROUP BY user_id
            )`)
        }
    }
});


        // Return the results, defaulting to 0 if no entries are found
        res.json({
            chicken_quantity: chickentotal || 0,
            egg_quantity: eggTotal || 0,
            feed_quantity: feedTotal || 0
        });
    } catch (error) {
        console.error('Error fetching quantities for selected date:', error);
        res.status(500).json({ error: 'An error occurred while fetching the quantities for the selected date.' });
    }
};

const getTotalCountselectedDateCrp = async (req, res) => {
    try {
        // Get selected date from query parameters, default to today if not provided
        const selectedDate = req.query.date ? moment(req.query.date).startOf('day').toDate() : moment().startOf('day').toDate();

        // Sum the quantity for Eggs for the selected date
        const eggTotal = await EggOrder.sum('quantity', {
            where: {
                date: {
                    [Op.gte]: selectedDate, // Greater than or equal to selected date
                    [Op.lt]: moment(selectedDate).add(1, 'days').toDate() // Less than the next day
                }
            }
        });

        // Sum the quantity for Feeds for the selected date
        const feedTotal = await FeedOrder.sum('quantity', {
            where: {
                date: { // Ensure 'date' is used in place of 'feed_date'
                    [Op.gte]: selectedDate, // Greater than or equal to selected date
                    [Op.lt]: moment(selectedDate).add(1, 'days').toDate() // Less than the next day
                }
            }
        });

        // Return the results, defaulting to 0 if no entries are found
        res.json({
            egg_quantity_crp: eggTotal || 0,
            feed_quantity_crp: feedTotal || 0
        });
    } catch (error) {
        console.error('Error fetching CRP quantities for selected date:', error);
        res.status(500).json({ error: 'An error occurred while fetching the CRP quantities for the selected date.' });
    }
};






module.exports = {
    getAdminDetailsByMobile,
    getBeneficiaryByNumber,
    getTotalCountBeneficiary,
    getAllDateQuantitiesBeneficiary,
    getUnreceivedFeedOrdersCrp,
    getTotalCountCrp,
    getTotalCountSelectedDateBeneficiary,
    getTotalCountselectedDateCrp
};
