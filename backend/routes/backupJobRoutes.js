const express = require('express');
const router = express.Router();
const BackupJobController = require('../controllers/backupJobController');

// POST /api/backup-jobs
router.post('/', BackupJobController.create);

// GET /api/backup-jobs (permet ?configId=...)
router.get('/', BackupJobController.getAll);

// GET /api/backup-jobs/:id
router.get('/:id', BackupJobController.getById);

// PUT /api/backup-jobs/:id
router.put('/:id', BackupJobController.update);

// DELETE /api/backup-jobs/:id
router.delete('/:id', BackupJobController.delete);

module.exports = router;