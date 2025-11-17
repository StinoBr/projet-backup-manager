'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RestoreLog extends Model {
    static associate(models) {
      // Un log de restauration est lié à la config BDD cible
      this.belongsTo(models.DatabaseConfig, {
        foreignKey: 'databaseConfigId',
        as: 'config',
      });
      // Et lié au fichier de sauvegarde que nous avons utilisé
      this.belongsTo(models.BackupLog, {
        foreignKey: 'backupLogId',
        as: 'backupLog',
      });
    }
  }
  RestoreLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    databaseConfigId: { // La BDD *cible* de la restauration
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'database_configs', key: 'id' },
      onDelete: 'CASCADE',
    },
    backupLogId: { // Le fichier .sql/.zip *source*
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'backup_logs', key: 'id' },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('pending', 'running', 'success', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endTime: {
      type: DataTypes.DATE,
    },
    message: {
      type: DataTypes.TEXT,
    }
  }, {
    sequelize,
    modelName: 'RestoreLog',
    tableName: 'restore_logs',
    timestamps: false,
  });
  return RestoreLog;
};