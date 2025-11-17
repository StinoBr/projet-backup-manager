// Importe le modèle Sequelize que nous avons créé
const { DatabaseConfig } = require('../models');
// --- MODIFICATION ICI ---
// Nous n'avons plus besoin de CryptoService ici pour la création,
// car le modèle (via les hooks) s'en charge.
// On le garde juste en commentaire pour plus tard.
// const CryptoService = require('../utils/CryptoService');

/**
 * Service pour gérer la logique métier des configurations de BDD.
 */
class DatabaseConfigService {

  /**
   * Crée une nouvelle configuration de BDD.
   * @param {object} configData - Les données de la config (name, dbType, host...)
   * @returns {Promise<DatabaseConfig>} La configuration créée
   */
  async createConfig(configData) {
    // --- MODIFICATION ICI ---
    // Plus besoin de chiffrer ici.
    // On passe juste le mot de passe en clair au modèle.
    // Le hook 'beforeCreate' du modèle va le chiffrer.
    
    try {
      const newConfig = await DatabaseConfig.create({
        name: configData.name,
        dbType: configData.dbType,
        host: configData.host,
        port: configData.port,
        username: configData.username,
        password: configData.password, // Le hook s'en charge !
        databaseName: configData.databaseName,
      });
      
      // On ne veut jamais renvoyer le mot de passe (même chiffré) au client
      newConfig.password = undefined; 
      return newConfig;

    } catch (error) {
      console.error("Erreur lors de la création de la config BDD :", error);
      // Renvoie une erreur plus propre
      throw new Error("Impossible de créer la configuration. Vérifiez vos données.");
    }
  }

  /**
   * Récupère toutes les configurations de BDD.
   * @returns {Promise<DatabaseConfig[]>} Liste des configurations
   */
  async getAllConfigs() {
    try {
      // 'scope: "withoutPassword"' serait idéal ici, mais pour l'instant :
      const configs = await DatabaseConfig.findAll({
        // Ne jamais inclure le mot de passe dans les listes !
        attributes: { exclude: ['password'] }
      });
      return configs;
    } catch (error) {
      console.error("Erreur lors de la récupération des configs BDD :", error);
      throw new Error("Impossible de récupérer les configurations.");
    }
  }

  /**
   * Récupère une configuration par son ID.
   * @param {string} id - L'UUID de la configuration
   * @returns {Promise<DatabaseConfig>} La configuration trouvée
   */
  async getConfigById(id) {
    try {
      const config = await DatabaseConfig.findByPk(id, {
        attributes: { exclude: ['password'] } // Exclure le mot de passe
      });
      
      if (!config) {
        throw new Error("Configuration non trouvée.");
      }
      return config;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la config ${id} :`, error);
      throw error; // Renvoie l'erreur (soit "non trouvée", soit BDD)
    }
  }

  // TODO: Implémenter updateConfig(id, data)
  
  /**
   * Met à jour une configuration de BDD.
   * @param {string} id - L'UUID de la configuration
   * @param {object} updateData - Les données à mettre à jour
   * @returns {Promise<DatabaseConfig>} La configuration mise à jour
   */
  async updateConfig(id, updateData) {
    try {
      const config = await DatabaseConfig.findByPk(id);
      if (!config) {
        throw new Error("Configuration non trouvée.");
      }

      // 'updateData' ne contiendra que les champs envoyés.
      // Si 'password' est présent, le hook 'beforeUpdate' le chiffrera.
      // Si 'password' n'est pas présent, il ne sera pas touché.
      await config.update(updateData);

      // On recharge pour être sûr (optionnel, mais propre) et on exclut le mot de passe
      const updatedConfig = await DatabaseConfig.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      return updatedConfig;

    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la config ${id} :`, error);
      // Renvoie l'erreur (soit "non trouvée", soit BDD)
      throw error;
    }
  }
  
  // TODO: Implémenter deleteConfig(id)
  
  /**
   * Supprime une configuration de BDD.
   * @param {string} id - L'UUID de la configuration
   * @returns {Promise<void>}
   */
  async deleteConfig(id) {
    try {
      const config = await DatabaseConfig.findByPk(id);
      if (!config) {
        throw new Error("Configuration non trouvée.");
      }

      // TODO: Ajouter une vérification
      // Avant de supprimer, on devrait vérifier qu'aucun 'BackupJob'
      // n'utilise cette configuration. Nous l'ajouterons plus tard.

      await config.destroy();
      
    } catch (error) {
      console.error(`Erreur lors de la suppression de la config ${id} :`, error);
      throw error;
    }
  }
}

// Exporte une instance unique du service (Singleton)
module.exports = new DatabaseConfigService();