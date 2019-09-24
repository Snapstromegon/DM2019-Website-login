const Sequelize = require('sequelize');
const argon2 = require('argon2');

module.exports = class Registrant extends Sequelize.Model {
  
  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        iufId: { type: Sequelize.INTEGER, allowNull: false, unique: true },
        type: { type: Sequelize.STRING, allowNull: false },
        club: DataTypes.STRING
      },
      {
        sequelize
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User);
  }
};
