module.exports = (sequelize, DataTypes) => {
    const FeedOrder = sequelize.define('FeedOrder', {
        order_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        crp_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'crp_table', // Table name in the database
                key: 'crp_id'
            }
        },
        date: {
            type: DataTypes.DATEONLY, // Only the date part
            allowNull: false
        },
        beneficiary_phone_number: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        received: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        received_date: {
            type: DataTypes.DATE
        },
        delivered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        delivery_date: {
            type: DataTypes.DATE
        }
    }, {
        tableName: 'feed_order', // Specify the table name explicitly
        timestamps: false
    });

    return FeedOrder;
};
