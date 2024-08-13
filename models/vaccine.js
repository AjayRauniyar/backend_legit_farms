module.exports = (sequelize, DataTypes) => {
    const Vaccine = sequelize.define('Vaccine', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // Reference to Users table
                key: 'id'
            }
        },
        vaccine_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'vaccines',
        timestamps: true // Automatically adds createdAt and updatedAt
    });

    return Vaccine;
};
