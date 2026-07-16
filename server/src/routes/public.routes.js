const router = require('express').Router();
const { requestElection, getPublicStats } = require('../controllers/public.controller');

router.post('/request-election', requestElection);
router.get('/stats', getPublicStats);

module.exports = router;