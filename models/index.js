const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false,
});

(async () => {
  await sequelize.sync({alter: true});
})();

const models = {
  sound: require('./sound')(sequelize, DataTypes),
};

module.exports = models;