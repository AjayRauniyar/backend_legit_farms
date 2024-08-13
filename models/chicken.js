module.exports = (sequelize, DataTypes) => {
    const Chicken = sequelize.define('Chicken', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // references the Users table
                key: 'id'
            }
        },
        start_date: DataTypes.DATE,
        total_count: DataTypes.INTEGER,
        culling_log: DataTypes.INTEGER,
        death_disease: DataTypes.INTEGER
    }, {
        tableName: 'Chickens',
        timestamps: true, // Explicitly specify the table name
    });

    return Chicken;
};
