// routes/payment.routes.js
const router = require('express').Router();
const paymentCtrl = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');

router.post('/create-intent', authenticate, paymentCtrl.createIntent);
router.post('/confirm', authenticate, paymentCtrl.confirmPayment);
router.post('/process-vote', authenticate, paymentCtrl.processVotePayment);
router.post('/khalti/initiate', authenticate, paymentCtrl.initiateKhaltiPayment);
router.post('/khalti/verify', paymentCtrl.verifyKhaltiPayment);


module.exports = router;