const Sequelize = require('sequelize');
const argon2 = require('argon2');

module.exports = class User extends Sequelize.Model {
  verifyPassword(password) {
    return argon2.verify(this.password, password);
  }

  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        name: { type: DataTypes.STRING, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false }
      },
      {
        sequelize,
        hooks: {
          beforeCreate: async user => {
            user.password = await argon2.hash(user.password);
          },
          beforeUpdate: async user => {
            if (!user.password.startsWith('$argon2')) {
              user.password = await argon2.hash(user.password);
            }
          }
        }
      }
    );
  }

  static associate(models) {
    this.belongsToMany(models.Role, { through: 'UserRole' });
  }

  static async createDefaultUser(models) {
    for (const userToCreate of config.secrets.login.defaultUsers) {
      const user = (await this.findOrCreate({
        where: { name: userToCreate.name },
        defaults: { password: userToCreate.password }
      }))[0];
      for (const roleName of userToCreate.roles) {
        const role = await models.Role.findOne({ where: { name: roleName } });
        user.addRole(role);
      }
    }
  }
};
