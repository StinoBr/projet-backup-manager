'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('restore_logs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      databaseConfigId: { // La BDD *cible*
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'database_configs',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      backupLogId: { // Le fichier .sql/.zip *source*
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'backup_logs',
          key: 'id',
        },
        onDelete: 'CASCADE', // Si le log de backup est supprimé, celui-ci aussi
      },
      status: {
        type: Sequelize.ENUM('pending', 'running', 'success', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      }
      // Pas de timestamps (createdAt/updatedAt)
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('restore_logs');
  }
};