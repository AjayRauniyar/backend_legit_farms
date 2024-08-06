module.exports = (sequelize, DataTypes) => {
    const Egg = sequelize.define('Egg', {
        user_id: DataTypes.INTEGER,
        date: DataTypes.DATE,
        quantity: DataTypes.INTEGER,
    });

    return Egg;
};
