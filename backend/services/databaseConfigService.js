// Importe le modèle Sequelize que nous avons créé
const { DatabaseConfig } = require('../models');
const CryptoService = require('../utils/CryptoService'); 
const { Client: PgClient } = require('pg'); // Pour tester PostgreSQL
const mysql = require('mysql2/promise'); // Pour tester MySQL

/**
 * Service pour gérer la logique métier des configurations de BDD.
 */
class DatabaseConfigService {

  // --- (Méthodes existantes: createConfig, getAllConfigs, getConfigById, updateConfig, deleteConfig) ---
  
  /**
   * Crée une nouvelle configuration de BDD.
   * @param {object} configData - Les données de la config (name, dbType, host...)
   * @returns {Promise<DatabaseConfig>} La configuration créée
   */
  async createConfig(configData) {
    // ... (Code existant)
    try {
      const newConfig = await DatabaseConfig.create({
        name: configData.name,
        dbType: configData.dbType,
        host: configData.host,
        port: configData.port,
        username: configData.username,
        password: configData.password, 
        databaseName: configData.databaseName,
      });
      
      newConfig.password = undefined; 
      return newConfig;

    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error);
      throw error;
    }
  }

  /**
   * Récupère toutes les configurations de BDD.
   * @returns {Promise<DatabaseConfig[]>} Liste des configurations
   */
  async getAllConfigs() {
    try {
      const configs = await DatabaseConfig.findAll({
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
        attributes: { exclude: ['password'] }
      });
      
      if (!config) {
        throw new Error("Configuration non trouvée.");
      }
      return config;
    } catch (error) {
      throw error;
    }
  }

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

      await config.update(updateData);

      const updatedConfig = await DatabaseConfig.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      return updatedConfig;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la config ${id} :`, error);
      throw error;
    }
  }
  
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

      await config.destroy();
      
    } catch (error) {
      console.error(`Erreur lors de la suppression de la config ${id} :`, error);
      throw error;
    }
  }
  
  // --- NOUVELLE MÉTHODE ---
  /**
   * Tente d'établir une connexion à une BDD externe en utilisant 
   * les données fournies (sans les sauvegarder).
   * @param {object} configData - Les données de connexion
   * @returns {Promise<void>} Résout en cas de succès, rejette en cas d'échec
   */
  async testConnection(configData) {
    const { dbType, host, port, username, password, databaseName } = configData;
    let client;
    
    try {
      switch (dbType) {
        case 'postgres':
          // Utilise le client pg pour tester la connexion
          client = new PgClient({
            user: username,
            host: host,
            database: databaseName,
            password: password,
            port: port,
            // Timeout rapide pour éviter de bloquer trop longtemps
            connectionTimeoutMillis: 5000, 
            statementTimeout: 5000,
          });
          
          await client.connect();
          await client.query('SELECT 1'); // Simple requête pour vérifier
          await client.end();
          break;

        case 'mysql':
          // Utilise mysql2/promise
          const connection = await mysql.createConnection({
            host: host,
            user: username,
            password: password,
            database: databaseName,
            port: port,
            connectTimeout: 5000,
          });

          await connection.query('SELECT 1'); // Simple requête
          await connection.end();
          break;

        default:
          throw new Error(`Type de BDD non supporté pour le test: ${dbType}`);
      }
      
    } catch (error) {
      // Ferme la connexion si elle est ouverte et qu'il y a eu une erreur
      if (client && dbType === 'postgres') {
        try { await client.end(); } catch (e) {}
      }
      console.error(`Erreur de connexion ${dbType}:`, error.message);
      
      // Mappe les erreurs génériques en messages compréhensibles
      const errorMessage = error.message.includes('password') 
        ? "Mot de passe, utilisateur ou base de données incorrect(s)."
        : (error.message.includes('timeout') || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED')
          ? "Impossible de se connecter à l'hôte. Vérifiez l'adresse ou le port."
          : `Erreur de BDD: ${error.message.substring(0, 100)}`; // Trunque le message

      throw new Error(errorMessage);
    }
  }
}

module.exports = new DatabaseConfigService();