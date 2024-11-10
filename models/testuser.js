const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const testuser = sequelize.define('testuser', {
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
  }, {
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  });

  testuser.prototype.validPassword = function(password) {
    return bcrypt.compare(password, this.password);
  };

  return testuser;
};
