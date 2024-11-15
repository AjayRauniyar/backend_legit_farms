const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const testuser = sequelize.define('testusers', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });



  return testuser;
};
