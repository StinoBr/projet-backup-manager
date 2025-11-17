const { BackupJob, DatabaseConfig } = require('../models');
// --- AJOUT ICI ---
// On importe le singleton du planificateur !
const SchedulerService = require('../jobs/schedulerService');
// --- FIN DE L'AJOUT ---

/**
 * Service pour gérer la logique métier des tâches de sauvegarde.
 */
class BackupJobService {

  /**
   * Crée une nouvelle tâche de sauvegarde.
   * @param {object} jobData - Données de la tâche (schedule, type, databaseConfigId...)
   * @returns {Promise<BackupJob>} La tâche créée
   */
  async createJob(jobData) {
    try {
      // On vérifie que la config BDD existe
      const config = await DatabaseConfig.findByPk(jobData.databaseConfigId);
      if (!config) {
        throw new Error("La configuration de base de données n'existe pas.");
      }
      
      const newJob = await BackupJob.create(jobData);

      // --- AJOUT ICI ---
      // Notifie le planificateur qu'une nouvelle tâche existe
      if (newJob.enabled) {
        // On doit recharger la config pour la passer au scheduler
        const jobWithConfig = await this.getJobById(newJob.id);
        SchedulerService.scheduleJob(jobWithConfig);
      }
      // --- FIN DE L'AJOUT ---

      return newJob;
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error);
      throw error;
    }
  }

  /**
   * Récupère toutes les tâches, en incluant les infos de la config BDD associée.
   * @param {string} [configId] - Optionnel : filtre par ID de configuration BDD
   * @returns {Promise<BackupJob[]>} Liste des tâches
   */
  async getAllJobs(configId) {
    try {
      const options = {
        // C'est ici qu'on utilise l'association !
        // On inclut le modèle 'DatabaseConfig' via l'alias 'config'
        include: {
          model: DatabaseConfig,
          as: 'config',
          attributes: ['name', 'dbType'] // On ne prend que le nom et le type
        },
        order: [['createdAt', 'DESC']]
      };

      if (configId) {
        options.where = { databaseConfigId: configId };
      }

      const jobs = await BackupJob.findAll(options);
      return jobs;
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error);
      throw new Error("Impossible de récupérer les tâches.");
    }
  }

  /**
   * Récupère une tâche par son ID.
   * @param {string} id - L'UUID de la tâche
   * @returns {Promise<BackupJob>} La tâche trouvée
   */
  async getJobById(id) {
    try {
      const job = await BackupJob.findByPk(id, {
        include: { model: DatabaseConfig, as: 'config' }
      });
      
      if (!job) {
        throw new Error("Tâche de sauvegarde non trouvée.");
      }
      return job;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Met à jour une tâche de sauvegarde.
   * @param {string} id - L'UUID de la tâche
   * @param {object} updateData - Données à mettre à jour
   * @returns {Promise<BackupJob>} La tâche mise à jour
   */
  async updateJob(id, updateData) {
    try {
      const job = await BackupJob.findByPk(id);
      if (!job) {
        throw new Error("Tâche de sauvegarde non trouvée.");
      }
      
      await job.update(updateData);
      const updatedJob = await this.getJobById(id); // Recharge pour inclure la config

      // --- AJOUT ICI ---
      // Met à jour le planificateur en direct
      // 1. On arrête l'ancienne tâche (si elle existait)
      SchedulerService.stopScheduledJob(updatedJob.id);

      // 2. Si la tâche est activée, on la (re)planifie
      if (updatedJob.enabled) {
        SchedulerService.scheduleJob(updatedJob);
      }
      // --- FIN DE L'AJOUT ---

      return updatedJob;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Supprime une tâche de sauvegarde.
   * @param {string} id - L'UUID de la tâche
   * @returns {Promise<void>}
   */
  async deleteJob(id) {
    try {
      const job = await BackupJob.findByPk(id);
      if (!job) {
        throw new Error("Tâche de sauvegarde non trouvée.");
      }

      // --- AJOUT ICI ---
      // Avant de supprimer la tâche de la BDD,
      // on la supprime du planificateur
      SchedulerService.stopScheduledJob(id);
      // --- FIN DE L'AJOUT ---

      await job.destroy();
    } catch (error) {
      throw error;
    }
  }
}

// Exporte une instance unique du service
module.exports = new BackupJobService();