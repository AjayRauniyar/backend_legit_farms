module.exports = (sequelize, DataTypes) => {
    const Feed = sequelize.define('Feed', {
        user_id: DataTypes.INTEGER,
        feed_type: DataTypes.STRING,
        feed_date: DataTypes.DATE,
        projected_qty: DataTypes.INTEGER,
        actual_qty: DataTypes.INTEGER,
    });

    return Feed;
};
