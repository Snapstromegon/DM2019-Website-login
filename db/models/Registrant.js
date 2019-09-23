const Sequelize = require('sequelize');
const argon2 = require('argon2');

module.exports = class Registrant extends Sequelize.Model {
  verifyAccessCode(accessCode) {
    return argon2.verify(this.accessCode, accessCode);
  }

  async getSeriealizeable() {
    return { id: this.id, name: this.name, iufId: this.iufId, roles: (await this.getRoles()).map(role => {return {id: role.id, name:role.name}}) };
  }

  get displayName(){
    return this.name;
  }
  
  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        name: { type: Sequelize.STRING, allowNull: false },
        iufId: { type: Sequelize.INTEGER, allowNull: false, unique: true },
        type: { type: Sequelize.STRING, allowNull: false },
        club: DataTypes.STRING,
        accessCode: {
          type: Sequelize.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        hooks: {
          beforeCreate: async registrant => {
            registrant.accessCode = await argon2.hash(registrant.accessCode);
          },
          beforeUpdate: async registrant => {
            if (!registrant.accessCode.startsWith('$argon2')) {
              registrant.accessCode = await argon2.hash(registrant.accessCode);
            }
          }
        }
      }
    );
  }

  static associate(models) {
    this.belongsToMany(models.Role, {through: 'RegistrantRole'});
  }
};
