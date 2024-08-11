module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        aadhaar: {
            type: DataTypes.STRING,
            defaultValue: 'No Information',
        },
        role: DataTypes.STRING,
        crp: {
            type: DataTypes.STRING,
            defaultValue: 'No Information',
        },
        village: {
            type: DataTypes.STRING,
            defaultValue: 'No Information',
        },
        mahila_parishad: {
            type: DataTypes.STRING,
            defaultValue: 'No Information',
        },
        default_lang: DataTypes.STRING,
        address: {
            type: DataTypes.STRING,
            defaultValue: 'No Information',
        },
        picture: {
            type: DataTypes.TEXT,
            allowNull: true,
          },    
        chicken_date: DataTypes.DATE,
        cluster: {
            type: DataTypes.STRING,
            defaultValue: 'No Information',
        },
    });

    return User;
};
