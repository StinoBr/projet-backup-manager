const { BackupLog, BackupJob, DatabaseConfig, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Service pour calculer les statistiques du Dashboard.
 */
class DashboardService {

  /**
   * Récupère toutes les statistiques principales.
   * @returns {Promise<object>} Un objet avec toutes les statistiques
   */
  async getStats() {
    try {
      // 1. Définir la plage "Aujourd'hui" (dernières 24h)
      const twentyFourHoursAgo = new Date(new Date() - 24 * 60 * 60 * 1000);

      // 2. Statistiques des Tâches (Jobs)
      const totalJobs = await BackupJob.count();
      const enabledJobs = await BackupJob.count({ where: { enabled: true } });

      // 3. Statistiques des Configurations
      const totalConfigs = await DatabaseConfig.count();

      // 4. Statistiques des Sauvegardes (Logs)
      const totalBackups = await BackupLog.count();
      const successfulBackups = await BackupLog.count({ where: { status: 'success' } });
      const failedBackups = await BackupLog.count({ where: { status: 'failed' } });

      // 5. Statistiques "Aujourd'hui"
      const successfulToday = await BackupLog.count({
        where: {
          status: 'success',
          startTime: { [Op.gte]: twentyFourHoursAgo }
        }
      });
      const failedToday = await BackupLog.count({
        where: {
          status: 'failed',
          startTime: { [Op.gte]: twentyFourHoursAgo }
        }
      });

      // 6. Espace disque total utilisé
      const totalSizeResult = await BackupLog.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('fileSize')), 'totalSize']
        ],
        where: { status: 'success' }
      });
      const totalSize = totalSizeResult?.getDataValue('totalSize') || 0;

      // 7. Dernières sauvegardes (juste les 5 plus récentes)
      const recentBackups = await BackupLog.findAll({
        limit: 5,
        order: [['startTime', 'DESC']],
        include: [{
          model: BackupJob, as: 'job',
          include: [{ model: DatabaseConfig, as: 'config', attributes: ['name'] }]
        }]
      });

      return {
        totalJobs,
        enabledJobs,
        totalConfigs,
        totalBackups,
        successfulBackups,
        failedBackups,
        successfulToday,
        failedToday,
        totalSize,
        recentBackups
      };

    } catch (error) {
      console.error("Erreur lors du calcul des statistiques:", error);
      throw new Error("Impossible de charger les statistiques du dashboard.");
    }
  }
}

// Exporte une instance unique
module.exports = new DashboardService();