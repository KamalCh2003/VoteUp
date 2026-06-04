const router = require('express').Router();
const ctrl = require('../controllers/election.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authenticate, requireRole('ADMIN'), ctrl.create);
router.put('/:id', authenticate, requireRole('ADMIN'), ctrl.update);
router.delete('/:id', authenticate, requireRole('ADMIN'), ctrl.delete);

module.exports = router;