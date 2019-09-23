const Sequelize = require('sequelize');

module.exports = class Role extends Sequelize.Model {
  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        name: { type: Sequelize.STRING, allowNull: false }
      },
      {
        sequelize
      }
    );
  }

  static associate(models) {
    this.belongsToMany(models.Registrant, {through: 'RegistrantRole'});
    this.belongsToMany(models.User, {through: 'UserRole'});
  }

  static async createDefautRoles(){
    await this.findOrCreate({where: {name: "Admin"}});
    await this.findOrCreate({where: {name: "Payment"}});
    await this.findOrCreate({where: {name: "Handout"}});
    // await this.findOrCreate({where: {name: ""}});
  }
};
