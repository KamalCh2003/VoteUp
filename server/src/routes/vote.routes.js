const router = require('express').Router();
const voteController = require('../controllers/vote.controller.js');
const authenticate = require('../middleware/authenticate.js');

router.post('/', authenticate, voteController.castVote);

module.exports = router;