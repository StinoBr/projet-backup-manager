const BackupJobService = require('../services/backupJobService');

/**
 * Gère les requêtes HTTP pour les tâches de sauvegarde.
 */
class BackupJobController {

  /**
   * POST /api/backup-jobs
   * Crée une nouvelle tâche.
   */
  async create(req, res) {
    try {
      const newJob = await BackupJobService.createJob(req.body);
      res.status(201).json(newJob);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * GET /api/backup-jobs
   * Récupère toutes les tâches (ou filtrées par configId).
   */
  async getAll(req, res) {
    try {
      // Permet de filtrer par ?configId=...
      const { configId } = req.query; 
      const jobs = await BackupJobService.getAllJobs(configId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * GET /api/backup-jobs/:id
   * Récupère une tâche spécifique.
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const job = await BackupJobService.getJobById(id);
      res.json(job);
    } catch (error) {
      if (error.message.includes("non trouvée")) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  /**
   * PUT /api/backup-jobs/:id
   * Met à jour une tâche.
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedJob = await BackupJobService.updateJob(id, req.body);
      res.json(updatedJob);
    } catch (error) {
      if (error.message.includes("non trouvée")) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  /**
   * DELETE /api/backup-jobs/:id
   * Supprime une tâche.
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await BackupJobService.deleteJob(id);
      res.status(204).send();
    } catch (error) {
      if (error.message.includes("non trouvée")) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }
}

// Exporte une instance unique
module.exports = new BackupJobController();