'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('backup_jobs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      databaseConfigId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'database_configs', // Nom de la table référencée
          key: 'id',
        },
        onDelete: 'CASCADE', // Si la config est supprimée, la tâche l'est aussi
      },
      schedule: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '0 2 * * *',
      },
      backupType: {
        type: Sequelize.ENUM('full'),
        allowNull: false,
        defaultValue: 'full',
      },
      storageType: {
        type: Sequelize.ENUM('local'),
        allowNull: false,
        defaultValue: 'local',
      },
      storagePath: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      compression: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable('backup_jobs');
  }
};