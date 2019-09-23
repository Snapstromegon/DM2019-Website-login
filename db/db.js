const Sequelize = require('sequelize');

module.exports = async (options) => {
  const sequelize = new Sequelize.Sequelize(options);
  // pass your sequelize config here

  const Registrant = require('./models/Registrant.js');
  const Role = require('./models/Role.js');
  const User = require('./models/User.js');

  const models = {
    Registrant: Registrant.init(sequelize, Sequelize),
    User: User.init(sequelize, Sequelize),
    Role: Role.init(sequelize, Sequelize)
  };

  // Run `.associate` if it exists,
  // ie create relationships in the ORM
  Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(models));
  // Object.values(models)
  //   .filter(model => typeof model.registerHooks === 'function')
  //   .forEach(model => model.registerHooks());

  await sequelize.sync();

  await Role.createDefautRoles();
  await User.createDefaultUser(models);

  return sequelize;
};
