const router = require('express').Router();
const ctrl = require('../controllers/candidate.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Apply for candidacy (with profile image)
router.post('/apply', authenticate, upload.single('profileImage'), ctrl.apply);

// Get own candidacy
router.get('/me', authenticate, ctrl.getMyCandidacy);

// Update profile (optional image)
router.put('/me', authenticate, upload.single('profileImage'), ctrl.updateProfile);

// Analytics
router.get('/me/analytics', authenticate, ctrl.getAnalytics);
router.get('/me/analytics/detailed', authenticate, ctrl.getDetailedAnalytics);
router.get('/history', authenticate, ctrl.getHistory);

module.exports = router;