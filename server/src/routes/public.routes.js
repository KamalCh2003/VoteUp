const router = require('express').Router();
const publicCtrl = require('../controllers/public.controller');

router.get('/stats', publicCtrl.getLandingStats);

module.exports = router;