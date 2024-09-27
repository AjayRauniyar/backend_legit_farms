module.exports = (sequelize, DataTypes) => {
    const Crptable = sequelize.define('Crptable', {
        crp_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        crp_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        village: {
            type: DataTypes.STRING(100)
        },
        phone_number: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique:true
        },
        picture: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        feedquantity: { // Add new feedQuantity field
            type: DataTypes.INTEGER, // Assuming the quantity is an integer
            allowNull: false // Set as required
        }
    }, {
        tableName: 'crp_table',
        timestamps: false
    });

    return Crptable;
};
