// Importe le service qui contient la logique métier
const DatabaseConfigService = require('../services/databaseConfigService');

/**
 * Gère les requêtes HTTP pour les configurations de BDD.
 */
class DatabaseConfigController {

  /**
   * POST /api/database-configs
   * Crée une nouvelle configuration de BDD.
   */
  async create(req, res) {
    try {
      // req.body contient les données JSON envoyées par le client (frontend)
      const newConfig = await DatabaseConfigService.createConfig(req.body);
      // 201 = Created
      res.status(201).json(newConfig); 
    } catch (error) {
      // 400 = Bad Request (ex: données manquantes, validation échouée)
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * GET /api/database-configs
   * Récupère toutes les configurations de BDD.
   */
  async getAll(req, res) {
    try {
      const configs = await DatabaseConfigService.getAllConfigs();
      // 200 = OK (défaut)
      res.json(configs);
    } catch (error) {
      // 500 = Internal Server Error
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * GET /api/database-configs/:id
   * Récupère une configuration spécifique par son ID.
   */
  async getById(req, res) {
    try {
      const { id } = req.params; // Récupère l'ID depuis l'URL
      const config = await DatabaseConfigService.getConfigById(id);
      res.json(config);
    } catch (error) {
      // Si le service renvoie "Configuration non trouvée",
      // on utilise un code 404 (Not Found)
      if (error.message === "Configuration non trouvée.") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  // TODO: Implémenter les méthodes 'update' et 'delete'

  /**
   * PUT /api/database-configs/:id
   * Met à jour une configuration de BDD.
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedConfig = await DatabaseConfigService.updateConfig(id, req.body);
      res.json(updatedConfig);
    } catch (error) {
      if (error.message === "Configuration non trouvée.") {
        res.status(404).json({ message: error.message });
      } else {
        // 400 pour une mauvaise validation, 500 pour le reste
        res.status(error.name === 'SequelizeValidationError' ? 400 : 500).json({ message: error.message });
      }
    }
  }

  /**
   * DELETE /api/database-configs/:id
   * Supprime une configuration de BDD.
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await DatabaseConfigService.deleteConfig(id);
      // 204 = No Content (succès, mais on ne renvoie rien)
      res.status(204).send();
    } catch (error) {
      if (error.message === "Configuration non trouvée.") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }
}

// Exporte une instance unique du contrôleur
module.exports = new DatabaseConfigController();