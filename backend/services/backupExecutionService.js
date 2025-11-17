const { BackupJob, BackupLog, DatabaseConfig } = require('../models');
const CryptoService = require('../utils/CryptoService');
const { executeBackup } = require('../utils/backupHelpers');
const { Op } = require('sequelize');

/**
 * Gère l'exécution d'une sauvegarde et la journalisation (logging).
 */
class BackupExecutionService {

  /**
   * Méthode principale appelée par le planificateur (scheduler).
   * @param {string} jobId - L'ID de la tâche à exécuter
   */
  async runJob(jobId) {
    console.log(`[Exec] Tentative d'exécution de la tâche ${jobId}`);
    let log; // Pour garder la référence du log
    let job;

    try {
      // 1. Récupérer la tâche et sa config (déchiffrage nécessaire)
      job = await BackupJob.findByPk(jobId, {
        include: { model: DatabaseConfig, as: 'config' }
      });

      if (!job) throw new Error("Tâche non trouvée.");
      if (!job.enabled) throw new Error("Tâche désactivée.");

      // On vérifie si une sauvegarde est déjà en cours pour cette tâche
      const runningLogs = await BackupLog.count({
        where: {
          backupJobId: jobId,
          status: 'running'
        }
      });

      if (runningLogs > 0) {
        console.warn(`[Exec] Tâche ${jobId} déjà en cours. Saut.`);
        return;
      }

      // 2. Créer l'entrée de Log initiale (status: 'running')
      log = await BackupLog.create({
        backupJobId: jobId,
        status: 'running',
        startTime: new Date(),
      });

      // 3. Lancer la sauvegarde (c'est la grosse opération)
      const result = await executeBackup(job);

      // 4. Mettre à jour le Log en cas de SUCCÈS
      await log.update({
        status: 'success',
        endTime: new Date(),
        filePath: result.filePath,
        fileSize: result.fileSize,
        message: 'Sauvegarde terminée avec succès.'
      });
      console.log(`[Exec] Succès: ${jobId}`);

    } catch (error) {
      console.error(`[Exec] Échec: ${jobId} - ${error.message}`);
      
      // 5. Mettre à jour le Log en cas d'ÉCHEC
      if (log) {
        await log.update({
          status: 'failed',
          endTime: new Date(),
          message: error.message || 'Erreur inconnue lors de l\'exécution.'
        });
      }
    }
  }
}

// Exporte une instance unique
module.exports = new BackupExecutionService();