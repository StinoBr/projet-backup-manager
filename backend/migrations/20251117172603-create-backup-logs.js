'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('backup_logs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      backupJobId: {
        type: Sequelize.UUID,
        allowNull: true, // Peut être null si la tâche est supprimée
        references: {
          model: 'backup_jobs', // Nom de la table des tâches
          key: 'id',
        },
        onDelete: 'SET NULL', // On garde les logs même si la tâche est supprimée
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
        allowNull: true, // Null tant que ce n'est pas fini
      },
      filePath: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fileSize: {
        type: Sequelize.BIGINT, // Pour les tailles en octets
        allowNull: true,
      },
      message: {
        type: Sequelize.TEXT, // Pour les longs messages d'erreur
        allowNull: true,
      }
      // Note: Pas de createdAt/updatedAt car on gère manuellement
      // avec startTime/endTime
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('backup_logs');
  }
};