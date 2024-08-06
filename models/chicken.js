module.exports = (sequelize, DataTypes) => {
    const Chicken = sequelize.define('Chicken', {
        user_id: DataTypes.INTEGER,
        start_date: DataTypes.DATE,
        male_count: DataTypes.INTEGER,
        female_count: DataTypes.INTEGER,
        culling_log: DataTypes.TEXT,
    });

    return Chicken;
};
