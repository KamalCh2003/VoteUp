// const router = require('express').Router();
// const ctrl = require('../controllers/admin.controller');
// const { authenticate } = require('../middleware/auth');
// const { requireRole } = require('../middleware/roleCheck');
// const upload = require('../middleware/upload'); 

// router.use(authenticate, requireRole('ADMIN'));

// // existing routes
// router.get('/stats', ctrl.getStats);
// router.get('/users', ctrl.getUsers);
// router.delete('/users/:id', ctrl.deleteUser);
// router.patch('/users/:id/role', ctrl.updateUserRole);
// router.post('/create-candidate', upload.single('avatar'), ctrl.createCandidateFromAdmin);
// router.put('/candidates/:id', upload.single('avatar'), ctrl.updateCandidate);
// router.put('/candidates/:id', ctrl.approveCandidate);
// router.delete('/candidates/:id', ctrl.deleteCandidate);
// router.get('/audit-logs', ctrl.getAuditLogs);
// router.get('/finance/revenue-trend', ctrl.getRevenueTrend);
// router.get('/finance/payment-methods', ctrl.getPaymentMethods);
// router.get('/finance/top-voters', ctrl.getTopVoters);
// router.get('/candidates', ctrl.getAllCandidates);
// router.delete('/votes/:id', ctrl.deleteVote);
// router.get('/votes', ctrl.getAllVotes);
// router.get('/finance/recent-payments', ctrl.getRecentPayments);

// module.exports = router;


const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.use(authenticate, requireRole('ADMIN'));

// User management
router.get('/stats', ctrl.getStats);
router.get('/users', ctrl.getUsers);
router.delete('/users/:id', ctrl.deleteUser);
router.patch('/users/:id/role', ctrl.updateUserRole);

// Candidate management
router.post('/create-candidate', upload.single('avatar'), ctrl.createCandidateFromAdmin);
router.put('/candidates/:id', upload.single('avatar'), ctrl.updateCandidate);        
router.patch('/candidates/:id/status', ctrl.approveCandidate);                      
router.delete('/candidates/:id', ctrl.deleteCandidate);
router.get('/candidates', ctrl.getAllCandidates);

// Vote management
router.delete('/votes/:id', ctrl.deleteVote);
router.get('/votes', ctrl.getAllVotes);

// Finance
router.get('/finance/revenue-trend', ctrl.getRevenueTrend);
router.get('/finance/payment-methods', ctrl.getPaymentMethods);
router.get('/finance/top-voters', ctrl.getTopVoters);
router.get('/finance/recent-payments', ctrl.getRecentPayments);

// Audit logs
router.get('/audit-logs', ctrl.getAuditLogs);

module.exports = router;