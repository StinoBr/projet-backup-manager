'use strict';
const { Model } = require('sequelize');
// --- MODIFICATION ICI ---
// On importe notre nouveau service
const CryptoService = require('../utils/CryptoService'); 

module.exports = (sequelize, DataTypes) => {
  class DatabaseConfig extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Exemple : Une config BDD peut avoir plusieurs Tâches de sauvegarde
      // --- MODIFICATION ICI ---
      this.hasMany(models.BackupJob, { 
        foreignKey: 'databaseConfigId',
        as: 'backupJobs' // On pourra faire 'config.getBackupJobs()'
      });
    }

    /**
     * Méthode d'instance pour déchiffrer le mot de passe.
     * N'est PAS stockée en BDD, c'est une fonction utilitaire du modèle.
     * @returns {string} Le mot de passe en clair
     */
    getDecryptedPassword() {
      // 'this.password' fait référence au champ 'password' de l'instance
      return CryptoService.decrypt(this.password);
    }
  }
  DatabaseConfig.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Nom donné par l\'utilisateur pour identifier cette BDD'
    },
    dbType: {
      type: DataTypes.ENUM('postgres', 'mysql', 'sqlite'),
      allowNull: false,
      comment: 'Type de SGBD'
    },
    host: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING, // IMPORTANT: Stockera le mot de passe chiffré
      allowNull: false,
      // --- MODIFICATION ICI ---
      // Nous n'avons plus besoin de getter/setter ici,
      // les "hooks" ci-dessous vont s'en charger.
    },
    databaseName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Nom de la base de données spécifique à sauvegarder'
    }
  }, {
    sequelize,
    modelName: 'DatabaseConfig',
    tableName: 'database_configs', // Nom de la table en BDD (convention)
    timestamps: true, // Ajoute createdAt et updatedAt
  });

  // --- HOOKS (MODIFICATION ICI) ---
  // Nous activons les hooks pour chiffrer automatiquement !
  
  /**
   * Hook Sequelize : s'exécute avant la création (INSERT)
   */
  DatabaseConfig.beforeCreate(async (config) => {
    config.password = CryptoService.encrypt(config.password);
  });

  /**
   * Hook Sequelize : s'exécute avant la mise à jour (UPDATE)
   */
  DatabaseConfig.beforeUpdate(async (config) => {
    // On ne rechiffre que si le champ 'password' a été modifié
    if (config.changed('password')) {
      config.password = CryptoService.encrypt(config.password);
    }
  });

  return DatabaseConfig;
};