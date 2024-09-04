module.exports = (sequelize, DataTypes) => {
    const FeedAudit = sequelize.define('FeedAudit', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        feed_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'feed_audit',
        timestamps: false
    });

    return FeedAudit;
};
