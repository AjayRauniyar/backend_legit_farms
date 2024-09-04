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
    
    Egg.associate = function(models) {
        Egg.belongsTo(models.User, { foreignKey: 'user_id' });
    };
    

    return Egg;
};
