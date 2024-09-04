const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./user')(sequelize, Sequelize);
const Chicken = require('./chicken')(sequelize, Sequelize);
const Egg = require('./egg')(sequelize, Sequelize);
const Feed = require('./feed')(sequelize, Sequelize);
const Vaccine = require('./vaccine')(sequelize, Sequelize); 
const Medicine = require('./medicine')(sequelize, Sequelize); 

const EggAudit = require('./EggAudit')(sequelize, Sequelize);
const FeedAudit = require('./FeedAudit')(sequelize, Sequelize);
const ChickenAudit = require('./ChickenAudit')(sequelize, Sequelize);



const Translation = require('./translation')(sequelize, Sequelize);

User.hasMany(Chicken, { foreignKey: 'user_id' });
Chicken.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Egg, { foreignKey: 'user_id' });
Egg.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Feed, { foreignKey: 'user_id' });
Feed.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Vaccine, { foreignKey: 'user_id' }); // Define relationship between User and Vaccine
Vaccine.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Medicine, { foreignKey: 'user_id' }); // Define relationship between User and Vaccine
Medicine.belongsTo(User, { foreignKey: 'user_id' });

// Set up relationships for audit tables
User.hasMany(EggAudit, { foreignKey: 'user_id', as: 'EggAudits' });
EggAudit.belongsTo(User, { foreignKey: 'user_id' });


User.hasMany(FeedAudit, { foreignKey: 'user_id', as: 'FeedAudits' });
FeedAudit.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(ChickenAudit, { foreignKey: 'user_id', as: 'ChickenAudits' });
ChickenAudit.belongsTo(User, { foreignKey: 'user_id' });




module.exports = {
    sequelize,
    User,
    Chicken,
    Egg,
    Feed,
    Translation,
    Vaccine,
    Medicine,
    EggAudit,
    FeedAudit,
    ChickenAudit
    
};
