const router = require('express').Router();
const ctrl = require('../controllers/election.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authenticate, requireRole('ADMIN'), upload.single('banner'), ctrl.create);
router.put('/:id', authenticate, requireRole('ADMIN'), upload.single('banner'), ctrl.update);
router.delete('/:id', authenticate, requireRole('ADMIN'), ctrl.delete);
router.patch('/:id/publish', authenticate, requireRole('ADMIN'), ctrl.publishResults);

module.exports = router;