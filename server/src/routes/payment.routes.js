const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');

router.post('/create-intent', authenticate, ctrl.createIntent);
router.post('/confirm', authenticate, ctrl.confirmPayment);
router.post('/vote-payment', authenticate, ctrl.processVotePayment); // mock fallback
router.post('/khalti/initiate', authenticate, ctrl.initiateKhaltiPayment);
router.post('/khalti/verify', authenticate, ctrl.verifyKhaltiPayment);

module.exports = router;