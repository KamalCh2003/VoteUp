const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.get('/maintenance-status', settingsController.getMaintenanceStatus);

router.get('/', authenticate, requireRole('ADMIN'), settingsController.getSettings);
router.put('/', authenticate, requireRole('ADMIN'), settingsController.updateSettings);

module.exports = router;