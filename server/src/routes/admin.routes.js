const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', ctrl.getStats);
router.get('/votes/trend', ctrl.getVoteTrend);
router.get('/users', ctrl.getUsers);
router.delete('/users/:id', ctrl.deleteUser);
router.patch('/users/:id/role', ctrl.updateUserRole);
router.get('/candidates', ctrl.getAllCandidates);
router.post('/create-candidate', upload.single('avatar'), ctrl.createCandidateFromAdmin);
router.put('/candidates/:id', upload.single('avatar'), ctrl.updateCandidate);
router.patch('/candidates/:id/status', ctrl.approveCandidate);
router.delete('/candidates/:id', ctrl.deleteCandidate);
router.get('/votes', ctrl.getAllVotes);
router.delete('/votes/:id', ctrl.deleteVote);
router.get('/finance/revenue-trend', ctrl.getRevenueTrend);
router.get('/finance/payment-methods', ctrl.getPaymentMethods);
router.get('/finance/top-voters', ctrl.getTopVoters);
router.get('/finance/recent-payments', ctrl.getRecentPayments);
router.get('/audit-logs', ctrl.getAuditLogs);
router.get('/notifications', ctrl.getNotifications);
router.patch('/notifications/:id/read', ctrl.markNotificationRead);
router.get('/notifications/unread-count', ctrl.getUnreadNotificationCount);

module.exports = router;