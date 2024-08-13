module.exports = (sequelize, DataTypes) => {
    const Egg = sequelize.define('Egg', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        date: DataTypes.DATE,
        quantity: DataTypes.INTEGER
    },{
        tableName: 'Eggs', // Explicitly specify the table name
    });

    return Egg;
};
