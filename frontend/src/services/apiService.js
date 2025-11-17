import axios from 'axios';

// Crée une instance d'axios pré-configurée
// L'URL de base pointe vers notre backend Express
const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Service pour interagir avec l'API des configurations de BDD.
 */
export const databaseConfigApi = {
  /**
   * Récupère toutes les configurations.
   * Appel GET /api/database-configs
   */
  getAll: () => apiClient.get('/database-configs'),

  /**
   * Crée une nouvelle configuration.
   * Appel POST /api/database-configs
   * @param {object} configData - Les données du formulaire
   */
  create: (configData) => apiClient.post('/database-configs', configData),
  
  /**
   * Supprime une configuration.
   * Appel DELETE /api/database-configs/:id
   * @param {string} id - L'ID de la config à supprimer
   */
  delete: (id) => apiClient.delete(`/database-configs/${id}`),

  /**
   * Récupère une config par ID.
   * @param {string} id - L'ID de la config
   */
  getById: (id) => apiClient.get(`/database-configs/${id}`),

  /**
   * Met à jour une config.
   * @param {string} id - L'ID de la config
   * @param {object} data - Données à mettre à jour
   */
  update: (id, data) => apiClient.put(`/database-configs/${id}`, data),
};

/**
 * Service pour interagir avec l'API des tâches de sauvegarde.
 */
export const backupJobApi = {
  /**
   * Récupère toutes les tâches.
   * Appel GET /api/backup-jobs
   * @param {string} [configId] - Optionnel, pour filtrer
   */
  getAll: (configId) => {
    const params = configId ? { configId } : {};
    return apiClient.get('/backup-jobs', { params });
  },

  /**
   * Crée une nouvelle tâche.
   * Appel POST /api/backup-jobs
   * @param {object} jobData - Données du formulaire
   */
  create: (jobData) => apiClient.post('/backup-jobs', jobData),

  /**
   * Met à jour une tâche (ex: activer/désactiver)
   * Appel PUT /api/backup-jobs/:id
   * @param {string} id - ID de la tâche
   * @param {object} updateData - Données à mettre à jour
   */
  update: (id, updateData) => apiClient.put(`/backup-jobs/${id}`, updateData),
  
  /**
   * Supprime une tâche.
   * Appel DELETE /api/backup-jobs/:id
   * @param {string} id - ID de la tâche
   */
  delete: (id) => apiClient.delete(`/backup-jobs/${id}`),
};

/**
 * Service pour interagir avec l'API de l'historique (logs).
 */
export const backupLogApi = {
  /**
   * Récupère tous les logs.
   * Appel GET /api/backup-logs
   * @param {string} [jobId] - Optionnel, pour filtrer
   */
  getAll: (jobId) => {
    const params = jobId ? { jobId } : {};
    return apiClient.get('/backup-logs', { params });
  },

  /**
   * Récupère un log spécifique.
   * Appel GET /api/backup-logs/:id
   * @param {string} id - ID du log
   */
  getById: (id) => apiClient.get(`/backup-logs/${id}`),
};

/**
 * Service pour interagir avec l'API de restauration.
 */
export const restoreApi = {
  /**
   * Déclenche une restauration.
   * Appel POST /api/restore
   * @param {string} backupLogId - ID du log de sauvegarde (fichier source)
   * @param {string} databaseConfigId - ID de la config (BDD cible)
   */
  start: (backupLogId, databaseConfigId) => {
    return apiClient.post('/restore', { backupLogId, databaseConfigId });
  },
  
  /**
   * Récupère l'historique des restaurations.
   * Appel GET /api/restore/logs
   */
  getLogs: () => apiClient.get('/restore/logs'),
};

/**
 * Service pour interagir avec l'API du Dashboard.
 */
export const dashboardApi = {
  /**
   * Récupère les statistiques.
   * Appel GET /api/dashboard/stats
   */
  getStats: () => apiClient.get('/dashboard/stats'),
};