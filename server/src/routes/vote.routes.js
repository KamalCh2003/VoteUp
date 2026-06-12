const router = require('express').Router();
const ctrl = require('../controllers/vote.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/results', ctrl.getAllResults);
router.get('/results/:electionId', ctrl.getResults);

// Protected routes
router.post('/', authenticate, ctrl.castVote);
router.get('/check/:electionId', authenticate, ctrl.checkVoted);

module.exports = router;