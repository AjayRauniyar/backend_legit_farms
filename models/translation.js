module.exports = (sequelize, DataTypes) => {
    const Translation = sequelize.define('Translation', {
        key: DataTypes.STRING,
        english: DataTypes.STRING,
        marathi: DataTypes.STRING,
    });

    return Translation;
};
