const router = require('express').Router();
const ctrl = require('../controllers/candidate.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/apply', authenticate, upload.single('avatar'), ctrl.apply);
router.get('/me', authenticate, ctrl.getMyCandidacy);
router.put('/me', authenticate, upload.single('avatar'), ctrl.updateProfile);
router.get('/me/analytics', authenticate, ctrl.getAnalytics);
router.get('/me/analytics/detailed', authenticate, ctrl.getDetailedAnalytics);
router.get('/me/history', authenticate, ctrl.getHistory);
router.get('/history', authenticate, ctrl.getHistory);

module.exports = router;