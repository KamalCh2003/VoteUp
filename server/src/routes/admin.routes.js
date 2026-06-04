const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.use(authenticate, requireRole('ADMIN'));
router.get('/stats', ctrl.getStats);
router.get('/users', ctrl.getUsers);
router.put('/candidates/:id', ctrl.approveCandidate);
router.get('/audit-logs', ctrl.getAuditLogs);
router.get('/finance/revenue-trend', ctrl.getRevenueTrend);
router.get('/finance/payment-methods', ctrl.getPaymentMethods);
router.get('/finance/top-voters', ctrl.getTopVoters);
router.get('/candidates', ctrl.getAllCandidates);

module.exports = router;