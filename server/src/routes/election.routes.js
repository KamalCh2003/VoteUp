const router = require('express').Router();
const ctrl = require('../controllers/election.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

// User requests a new election (authenticated users only)
router.post('/request', authenticate, ctrl.requestElection);


// Admin-only routes
router.post('/', authenticate, requireRole('ADMIN'), ctrl.create);
router.put('/:id', authenticate, requireRole('ADMIN'), ctrl.update);
router.delete('/:id', authenticate, requireRole('ADMIN'), ctrl.delete);

// Admin election management (approve/reject pending requests)
router.get('/admin/elections', authenticate, requireRole('ADMIN'), ctrl.getElectionsByStatus);
router.patch('/admin/elections/:id/approve', authenticate, requireRole('ADMIN'), ctrl.approveElection);
router.patch('/admin/elections/:id/reject', authenticate, requireRole('ADMIN'), ctrl.rejectElection);

module.exports = router;