const express = require('express');
const router = express.Router();
const RestoreController = require('../controllers/restoreController');

// Déclenche une restauration
// POST /api/restore
router.post('/', RestoreController.startRestore);

// TODO:
// GET /api/restore-logs (pour l'historique)
// --- AJOUT ---
router.get('/logs', RestoreController.getAllLogs);
// --- FIN DE L'AJOUT ---

module.exports = router;