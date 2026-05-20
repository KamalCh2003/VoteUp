const router = require('express').Router();
const electionController = require('../controllers/election.controller.js');
const authenticate = require('../middleware/authenticate.js');
const authorize = require('../middleware/authorize.js');

router.get('/', electionController.getAll);
router.get('/:id', electionController.getOne);
router.get('/:id/results', electionController.getResults);

router.use(authenticate, authorize('ADMIN'));
router.post('/', electionController.create);
router.put('/:id', electionController.update);
router.delete('/:id', electionController.remove);

module.exports = router;