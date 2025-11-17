const BackupLogService = require('../services/backupLogService');

/**
 * Gère les requêtes HTTP pour les logs (lecture seule).
 */
class BackupLogController {

  /**
   * GET /api/backup-logs
   * Récupère tous les logs (ou filtrés par jobId).
   */
  async getAll(req, res) {
    try {
      // Permet de filtrer par ?jobId=...
      const { jobId } = req.query; 
      const logs = await BackupLogService.getAllLogs(jobId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * GET /api/backup-logs/:id
   * Récupère un log spécifique.
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const log = await BackupLogService.getLogById(id);
      res.json(log);
    } catch (error) {
      if (error.message.includes("non trouvé")) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }
}

// Exporte une instance unique
module.exports = new BackupLogController();