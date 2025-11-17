const cron = require('node-cron');
const { BackupJob } = require('../models');
const BackupExecutionService = require('../services/backupExecutionService');

/**
 * Gère la planification des tâches (cron jobs).
 */
class SchedulerService {
  constructor() {
    this.scheduledTasks = new Map(); // Stocke les tâches cron
  }

  /**
   * Initialise le planificateur.
   * Charge toutes les tâches de la BDD et les planifie.
   */
  async initialize() {
    console.log('[Scheduler] Initialisation...');
    try {
      // 1. Récupérer toutes les tâches actives
      const activeJobs = await BackupJob.findAll({
        where: { enabled: true }
      });

      if (activeJobs.length === 0) {
        console.log('[Scheduler] Aucune tâche active trouvée.');
        return;
      }

      // 2. Créer une tâche 'node-cron' pour chaque
      activeJobs.forEach(job => {
        this.scheduleJob(job);
      });

      console.log(`[Scheduler] ${this.scheduledTasks.size} tâches planifiées.`);

    } catch (error) {
      console.error('[Scheduler] Erreur lors de l\'initialisation:', error);
    }
  }

  /**
   * Planifie une tâche (job).
   * @param {object} job - L'objet BackupJob de Sequelize
   */
  scheduleJob(job) {
    // Vérifie si la fréquence cron est valide
    if (!cron.validate(job.schedule)) {
      console.error(`[Scheduler] Fréquence Cron invalide (${job.schedule}) pour la tâche ${job.id}. Saut.`);
      return;
    }

    // --- AJOUT : S'assurer qu'elle n'est pas déjà planifiée ---
    if (this.scheduledTasks.has(job.id)) {
      console.warn(`[Scheduler] Tâche ${job.id} déjà planifiée. Saut.`);
      return;
    }

    // Planifie la tâche
    const task = cron.schedule(job.schedule, () => {
      console.log(`[Scheduler] Exécution de la tâche ${job.id} (Plan: ${job.schedule})`);
      // Appelle le service d'exécution
      BackupExecutionService.runJob(job.id);
    });

    // Stocke la référence pour pouvoir l'arrêter/modifier plus tard
    this.scheduledTasks.set(job.id, task);
    console.log(`[Scheduler] Tâche ${job.id} planifiée: ${job.schedule}`);
  }

  /**
   * Met à jour une tâche planifiée (ex: si l'utilisateur change la fréquence).
   * (Nous n'utilisons pas encore cela, mais c'est crucial pour la v2)
   */
  updateScheduledJob(jobId, newSchedule) {
    // ...
  }

  /**
   * Arrête une tâche planifiée (ex: si l'utilisateur désactive le 'toggle').
   */
  stopScheduledJob(jobId) {
    // --- IMPLÉMENTATION AJOUTÉE ---
    if (this.scheduledTasks.has(jobId)) {
      const task = this.scheduledTasks.get(jobId);
      task.stop(); // Arrête la tâche cron
      this.scheduledTasks.delete(jobId); // Supprime de notre suivi
      console.log(`[Scheduler] Tâche ${jobId} arrêtée.`);
    } else {
      console.warn(`[Scheduler] Tentative d'arrêt de la tâche ${jobId} non planifiée.`);
    }
  }
}

// Exporte une instance unique
module.exports = new SchedulerService();