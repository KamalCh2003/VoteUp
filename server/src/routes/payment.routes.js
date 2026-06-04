const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');

router.post('/create-intent', authenticate, ctrl.createIntent);
router.post('/confirm', authenticate, ctrl.confirmPayment);
router.get('/wallet', authenticate, ctrl.getWallet);

module.exports = router;