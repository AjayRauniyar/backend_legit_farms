module.exports = (sequelize, DataTypes) => {
    const CrpFeedOrder = sequelize.define('CrpFeedOrder', {
        order_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        crp_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'crp_table', // Reference to crp_table
                key: 'crp_id'
            }
        },
        phone_number: {
            type: DataTypes.STRING(15),
            allowNull: false,
            references: {
                model: 'crp_table', // Reference to crp_table
                key: 'phone_number'
            }
        },
        feed_order_date: {
            type: DataTypes.DATEONLY, // Date-only field for feed order
            allowNull: false
        },
        feed_delivery_date: {
            type: DataTypes.DATEONLY, // Date-only field for delivery
            allowNull: false
        },
        feed_received_date: {
            type: DataTypes.DATEONLY, // Date-only field for when the feed was received
            allowNull: true
        },
        received: {
            type: DataTypes.BOOLEAN,
            defaultValue: false // By default, the feed has not been received
        },
        feedquantity: { // Add new feedQuantity field
            type: DataTypes.INTEGER, // Assuming the quantity is an integer
            allowNull: false // Set as required
        }
    }, {
        tableName: 'crp_feed_order', // Specify table name explicitly
        timestamps: false
    });

    return CrpFeedOrder;
};
