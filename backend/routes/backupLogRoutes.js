const express = require('express');
const router = express.Router();
const BackupLogController = require('../controllers/backupLogController');

// GET /api/backup-logs (permet ?jobId=...)
router.get('/', BackupLogController.getAll);

// GET /api/backup-logs/:id
router.get('/:id', BackupLogController.getById);

// Pas de POST, PUT, DELETE - les logs sont gérés par le système.

module.exports = router;