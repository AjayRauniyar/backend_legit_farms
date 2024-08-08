const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(
    config.db.database,  
    config.db.username, 
    config.db.password, 
    {
        host: config.db.host,
        port: config.db.port,
        dialect: config.db.dialect,
        dialectOptions: {
            ssl: {
                require: true, // This will enforce SSL connection if your database requires it
                rejectUnauthorized: false, // This line is for testing purposes; remove it in production
            },
        },
    }
);


module.exports = sequelize;
