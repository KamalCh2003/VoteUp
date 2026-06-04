const router = require('express').Router();
const ctrl = require('../controllers/vote.controller');
const { authenticate } = require('../middleware/auth');

router.get('/results/:electionId', ctrl.getResults);
router.get('/results', ctrl.getAllResults);

router.post('/', authenticate, ctrl.castVote);
router.get('/check/:electionId', authenticate, ctrl.checkVoted);
router.get('/results/:electionId', ctrl.getResults);

module.exports = router;