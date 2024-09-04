module.exports = (sequelize, DataTypes) => {
    const Medicine = sequelize.define('Medicine', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // Reference to Users table
                key: 'id'
            }
        },
        medicine_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'medicines',
        timestamps: false // Automatically adds createdAt and updatedAt
    });

    return Medicine;
};
