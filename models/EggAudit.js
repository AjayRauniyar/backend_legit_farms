module.exports = (sequelize, DataTypes) => {
    const EggAudit = sequelize.define('EggAudit', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // Reference to the User model
                key: 'id'
            }
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'eggs_audit',
        timestamps: false // If there are no `createdAt` and `updatedAt` fields
    });

    return EggAudit;
};
