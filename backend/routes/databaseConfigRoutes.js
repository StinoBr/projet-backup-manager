const express = require('express');
const router = express.Router();
const DatabaseConfigController = require('../controllers/databaseConfigController');

// Définit les routes de l'API et les lie aux méthodes du contrôleur

// POST /api/database-configs
router.post('/', DatabaseConfigController.create);

// GET /api/database-configs
router.get('/', DatabaseConfigController.getAll);

// GET /api/database-configs/:id
router.get('/:id', DatabaseConfigController.getById);

// TODO: Ajouter les routes pour PUT (update) et DELETE
// --- Modifications ici ---
// PUT /api/database-configs/:id
router.put('/:id', DatabaseConfigController.update);

// DELETE /api/database-configs/:id
router.delete('/:id', DatabaseConfigController.delete);

module.exports = router;