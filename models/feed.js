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
        feed_date: DataTypes.DATE,
        quantity: DataTypes.INTEGER,
        
    },{
        tableName: 'Feeds', // Explicitly specify the table name
    });

    Feed.associate = function(models) {
        Feed.belongsTo(models.User, { foreignKey: 'user_id' });
    };
    

    return Feed;
};
