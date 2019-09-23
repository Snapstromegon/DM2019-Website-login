const Sequelize = require('sequelize');
const argon2 = require('argon2');

module.exports = class User extends Sequelize.Model {
  verifyPassword(password) {
    return argon2.verify(this.password, password);
  }

  async getSeriealizeable() {
    return {
      id: this.id,
      email: this.email,
      roles: (await this.getRoles()).map(role => {
        return { id: role.id, name: role.name };
      })
    };
  }

  get displayName() {
    return this.email;
  }

  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        email: { type: Sequelize.STRING, allowNull: false },
        password: { type: Sequelize.STRING, allowNull: false }
      },
      {
        sequelize,
        hooks: {
          beforeCreate: async user => {
            console.log('create');
            user.password = await argon2.hash(user.password);
          },
          beforeUpdate: async user => {
            console.log('update');
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
    const adminUser = config.secrets.adminUser;
    adminUser.roles.push('Admin');
    const usersToCreate = [...config.secrets.defaultUsers, adminUser];

    for (const userToCreate of usersToCreate) {
      const user = (await this.findOrCreate({
        where: { email: userToCreate.email },
        defaults: { password: userToCreate.password }
      }))[0];
      for (const roleName of userToCreate.roles) {
        const role = await models.Role.findOne({ where: { name: roleName } });
        user.addRole(role);
      }
    }
  }
};
