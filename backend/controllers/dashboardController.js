const DashboardService = require('../services/dashboardService');

/**
 * Gère les requêtes HTTP pour le Dashboard.
 */
class DashboardController {

  /**
   * GET /api/dashboard/stats
   * Récupère toutes les statistiques.
   */
  async getStats(req, res) {
    try {
      const stats = await DashboardService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

// Exporte une instance unique
module.exports = new DashboardController();