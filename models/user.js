module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: DataTypes.STRING,
        number: DataTypes.STRING,
        aadhaar: DataTypes.STRING,
        role: DataTypes.STRING,
        crp: DataTypes.STRING,
        village: DataTypes.STRING,
        mahila_parishad: DataTypes.STRING,
        default_lang: DataTypes.STRING,
        address: DataTypes.STRING,
        picture: DataTypes.STRING,
        chicken_date: DataTypes.DATE,
        cluster: DataTypes.STRING,
    });

    return User;
};
