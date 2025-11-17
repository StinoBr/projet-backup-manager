const { BackupLog, BackupJob } = require('../models');
const { DatabaseConfig } = require('../models');

/**
 * Service pour lire la logique métier des logs de sauvegarde.
 * Note : Les logs sont créés par le système, pas par l'utilisateur,
 * donc nous n'avons pas de 'createLog'.
 */
class BackupLogService {

  /**
   * Récupère tous les logs, en incluant les infos de la tâche
   * et de la configuration BDD associées.
   * @param {string} [jobId] - Optionnel : filtre par ID de tâche
   * @returns {Promise<BackupLog[]>} Liste des logs
   */
  async getAllLogs(jobId) {
    try {
      const options = {
        // On inclut la Tâche...
        include: {
          model: BackupJob,
          as: 'job',
          attributes: ['id'], // On ne veut pas tout
          // ...et dans la Tâche, on inclut la Config
          include: {
            model: DatabaseConfig,
            as: 'config',
            attributes: ['name', 'dbType'] // On veut le nom !
          }
        },
        order: [['startTime', 'DESC']] // Les plus récents en premier
      };

      if (jobId) {
        options.where = { backupJobId: jobId };
      }

      const logs = await BackupLog.findAll(options);
      return logs;
    } catch (error) {
      console.error("Erreur lors de la récupération des logs:", error);
      throw new Error("Impossible de récupérer l'historique.");
    }
  }

  /**
   * Récupère un log par son ID.
   * @param {string} id - L'UUID du log
   * @returns {Promise<BackupLog>} Le log trouvé
   */
  async getLogById(id) {
    try {
      const log = await BackupLog.findByPk(id, {
        include: {
          model: BackupJob,
          as: 'job',
          include: {
            model: DatabaseConfig,
            as: 'config',
            attributes: ['name', 'dbType']
          }
        }
      });
      
      if (!log) {
        throw new Error("Log de sauvegarde non trouvé.");
      }
      return log;
    } catch (error) {
      throw error;
    }
  }
}

// Exporte une instance unique du service
module.exports = new BackupLogService();