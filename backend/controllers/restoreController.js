const RestoreExecutionService = require('../services/restoreExecutionService');
// --- AJOUT ---
const RestoreLogService = require('../services/restoreLogService');

/**
 * Gère les requêtes HTTP pour les restaurations.
 */
class RestoreController {

  /**
   * POST /api/restore
   * Déclenche une nouvelle restauration.
   */
  async startRestore(req, res) {
    const { backupLogId, databaseConfigId } = req.body;

    if (!backupLogId || !databaseConfigId) {
      return res.status(400).json({ message: "backupLogId et databaseConfigId sont requis." });
    }

    try {
      // On AWAIT ici. Le frontend attendra la fin.
      // Pour une v2, on pourrait renvoyer 202 et laisser
      // le frontend "poll" le statut du log.
      const log = await RestoreExecutionService.runRestore(backupLogId, databaseConfigId);
      res.status(201).json(log); // 201 = Created (le log de restauration)
    
    } catch (error) {
      // L'erreur contient déjà le message du service
      res.status(500).json({ message: error.message });
    }
  }

  // TODO:
  // GET /api/restore-logs (pour lister l'historique des restaurations)
  // --- AJOUT ---
  /**
   * GET /api/restore/logs
   * Récupère l'historique de toutes les restaurations.
   */
  async getAllLogs(req, res) {
    try {
      const logs = await RestoreLogService.getAllLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

// Exporte une instance unique
module.exports = new RestoreController();