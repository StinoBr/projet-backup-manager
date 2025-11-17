'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Le nom de la table doit correspondre au 'tableName'
    // défini dans votre modèle (DatabaseConfig.js)
    await queryInterface.createTable('database_configs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dbType: {
        type: Sequelize.ENUM('postgres', 'mysql', 'sqlite'),
        allowNull: false,
      },
      host: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      port: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Contiendra le mot de passe chiffré'
      },
      databaseName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('database_configs');
  }
};