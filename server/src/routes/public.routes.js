const express = require('express');
const router = express.Router();
const { requestElection, getPublicStats } = require('../controllers/public.controller');
const settingsController = require('../controllers/settings.controller');

router.get('/maintenance-status', settingsController.getMaintenanceStatus);

router.post('/request-election', requestElection);
router.get('/stats', settingsController.getPublicStats);

module.exports = router;