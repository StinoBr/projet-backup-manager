const { RestoreLog, BackupLog, DatabaseConfig } = require('../models');
const { executeRestore } = require('../utils/restoreHelpers');

/**
 * Gère l'orchestration d'une restauration et sa journalisation.
 */
class RestoreExecutionService {

  /**
   * Méthode principale appelée par le contrôleur.
   * @param {string} backupLogId - L'ID du fichier de sauvegarde
   * @param {string} databaseConfigId - L'ID de la BDD *cible*
   * @returns {Promise<RestoreLog>} Le log final de restauration
   */
  async runRestore(backupLogId, databaseConfigId) {
    console.log(`[Restore] Lancement de la restauration sur ${databaseConfigId} depuis ${backupLogId}`);
    let log;

    try {
      // 1. Valider les IDs
      const backupLog = await BackupLog.findByPk(backupLogId);
      if (!backupLog) throw new Error("Fichier de sauvegarde non trouvé.");
      if (backupLog.status !== 'success' || !backupLog.filePath) {
        throw new Error("La sauvegarde source est invalide ou n'a pas réussi.");
      }

      const targetConfig = await DatabaseConfig.findByPk(databaseConfigId);
      if (!targetConfig) throw new Error("Configuration BDD cible non trouvée.");

      // 2. Créer le Log de Restauration (status: 'running')
      log = await RestoreLog.create({
        backupLogId,
        databaseConfigId,
        status: 'running',
        startTime: new Date(),
      });

      // 3. Lancer la restauration (l'opération lourde)
      const successMessage = await executeRestore(backupLog, targetConfig);

      // 4. Mettre à jour le Log en cas de SUCCÈS
      await log.update({
        status: 'success',
        endTime: new Date(),
        message: successMessage,
      });
      console.log(`[Restore] Succès: ${log.id}`);
      return log;

    } catch (error) {
      console.error(`[Restore] Échec: ${error.message}`);
      // 5. Mettre à jour le Log en cas d'ÉCHEC
      if (log) {
        await log.update({
          status: 'failed',
          endTime: new Date(),
          message: error.message || 'Erreur inconnue lors de la restauration.',
        });
      }
      // Propager l'erreur au contrôleur
      throw error;
    }
  }
}

// Exporte une instance unique
module.exports = new RestoreExecutionService();