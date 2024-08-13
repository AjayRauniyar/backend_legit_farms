module.exports = (sequelize, DataTypes) => {
    const Feed = sequelize.define('Feed', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        feed_type: DataTypes.STRING,
        feed_date: DataTypes.DATE,
        projected_qty: DataTypes.INTEGER,
        actual_qty: DataTypes.INTEGER
    },{
        tableName: 'Feeds', // Explicitly specify the table name
    });

    return Feed;
};
