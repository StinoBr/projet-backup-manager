const { RestoreLog, BackupLog, BackupJob, DatabaseConfig } = require('../models');

/**
 * Service pour lire la logique métier des logs de restauration.
 */
class RestoreLogService {

  /**
   * Récupère tous les logs de restauration.
   * @returns {Promise<RestoreLog[]>} Liste des logs
   */
  async getAllLogs() {
    try {
      const logs = await RestoreLog.findAll({
        order: [['startTime', 'DESC']], // Les plus récents en premier
        include: [
          {
            // La BDD CIBLE qui a été écrasée
            model: DatabaseConfig,
            as: 'config',
            attributes: ['name', 'dbType']
          },
          {
            // Le Fichier SOURCE qui a été utilisé
            model: BackupLog,
            as: 'backupLog',
            attributes: ['id', 'startTime'],
            // Inclure le nom de la BDD source pour l'affichage
            include: {
              model: BackupJob,
              as: 'job',
              attributes: ['id'],
              include: {
                model: DatabaseConfig,
                as: 'config',
                attributes: ['name']
              }
            }
          }
        ]
      });
      return logs;
    } catch (error) {
      console.error("Erreur lors de la récupération des logs de restauration:", error);
      throw new Error("Impossible de récupérer l'historique des restaurations.");
    }
  }
}

// Exporte une instance unique
module.exports = new RestoreLogService();