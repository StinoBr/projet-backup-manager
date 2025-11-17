'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BackupJob extends Model {
    /**
     * Définit les associations.
     */
    static associate(models) {
      // Une tâche de sauvegarde appartient à UNE SEULE configuration de BDD
      this.belongsTo(models.DatabaseConfig, {
        foreignKey: 'databaseConfigId',
        as: 'config', // On pourra accéder à la config via 'job.getConfig()'
        onDelete: 'CASCADE', // Si on supprime la config, on supprime les tâches associées
      });
      
      // --- AJOUT ICI ---
      // Une tâche de sauvegarde A PLUSIEURS logs
      this.hasMany(models.BackupLog, { 
        foreignKey: 'backupJobId', 
        as: 'logs' 
      });
    }
  }
  BackupJob.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Clé étrangère
    databaseConfigId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'database_configs', // Nom de la table
        key: 'id',
      }
    },
    // Fréquence (ex: "0 2 * * *" pour 2h du matin tous les jours)
    schedule: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0 2 * * *', // Par défaut
    },
    backupType: {
      type: DataTypes.ENUM('full'),
      allowNull: false,
      defaultValue: 'full',
      comment: 'Pour l\'instant, seul \'full\' est supporté'
    },
    storageType: {
      type: DataTypes.ENUM('local'), // 's3', 'gcs'
      allowNull: false,
      defaultValue: 'local',
      comment: 'Pour l\'instant, seul \'local\' est supporté'
    },
    storagePath: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Chemin du dossier local (ex: /backups/mysql)'
    },
    compression: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Faut-il zipper la sauvegarde ?'
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Cette tâche est-elle active ?'
    }
  }, {
    sequelize,
    modelName: 'BackupJob',
    tableName: 'backup_jobs',
    timestamps: true,
  });
  return BackupJob;
};