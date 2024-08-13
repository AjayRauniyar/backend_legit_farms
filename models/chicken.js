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
        male_count: DataTypes.INTEGER,
        female_count: DataTypes.INTEGER,
        culling_log: DataTypes.TEXT
    }, {
        tableName: 'Chickens',
        timestamps: true, // Explicitly specify the table name
    });

    return Chicken;
};
