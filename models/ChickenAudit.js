module.exports = (sequelize, DataTypes) => {
    const ChickenAudit = sequelize.define('ChickenAudit', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        total_count: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        culling_log: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        death_disease: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'chicken_audit',
        timestamps: false
    });

    return ChickenAudit;
};
