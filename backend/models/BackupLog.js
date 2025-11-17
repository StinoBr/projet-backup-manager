'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BackupLog extends Model {
    /**
     * Définit les associations.
     */
    static associate(models) {
      // Un log appartient à UNE SEULE tâche
      this.belongsTo(models.BackupJob, {
        foreignKey: 'backupJobId',
        as: 'job',
        onDelete: 'SET NULL', // Si la tâche est supprimée, on garde le log
      });
    }
  }
  BackupLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    backupJobId: {
      type: DataTypes.UUID,
      allowNull: true, // Peut être null si la tâche a été supprimée
      references: {
        model: 'backup_jobs',
        key: 'id',
      },
      onDelete: 'SET NULL',
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
    filePath: {
      type: DataTypes.STRING,
      comment: 'Chemin complet du fichier de sauvegarde généré',
    },
    fileSize: {
      type: DataTypes.BIGINT, // Pour les fichiers volumineux
      comment: 'Taille du fichier en octets',
    },
    message: {
      type: DataTypes.TEXT, // Pour les messages d'erreur détaillés
      comment: 'Message de succès ou d\'erreur',
    }
  }, {
    sequelize,
    modelName: 'BackupLog',
    tableName: 'backup_logs',
    timestamps: false, // On gère les temps manuellement (startTime/endTime)
  });
  return BackupLog;
};