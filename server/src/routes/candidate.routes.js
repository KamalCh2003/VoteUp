const router = require('express').Router();
const ctrl = require('../controllers/candidate.controller');
const { authenticate } = require('../middleware/auth');

router.post('/apply', authenticate, ctrl.apply);
router.get('/me', authenticate, ctrl.getMyCandidacy);
router.put('/me', authenticate, ctrl.updateProfile);
router.get('/me/analytics', authenticate, ctrl.getAnalytics);

module.exports = router;