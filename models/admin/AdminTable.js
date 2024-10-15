module.exports = (sequelize, DataTypes) => {
    const AdminTable = sequelize.define('AdminTable', {
        admin_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        admin_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        phone_number: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true
        },
        village: {
            type: DataTypes.STRING(100)
        },
       
    }, {
        tableName: 'admin_table',
        timestamps: false
    });

    return AdminTable;
};
