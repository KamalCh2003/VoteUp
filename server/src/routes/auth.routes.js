// const router = require('express').Router();
// const ctrl = require('../controllers/auth.controller');
// const { validate } = require('../middleware/validate');
// const { body } = require('express-validator');
// const { authLimiter } = require('../middleware/rateLimiter');

// router.post('/register', authLimiter, [
//   body('email').isEmail(),
//   body('password').isLength({ min: 8 }),
//   body('firstName').trim().notEmpty(),
//   body('lastName').trim().notEmpty(),
//   body('nationalId').trim().notEmpty(),
// ], validate, ctrl.register);

// router.post('/login', authLimiter, [
//   body('email').isEmail(),
//   body('password').notEmpty(),
// ], validate, ctrl.login);

// router.get('/verify/:token', ctrl.verifyEmail);
// router.post('/forgot-password', [body('email').isEmail()], validate, ctrl.forgotPassword);
// router.post('/reset-password', [body('token').notEmpty(), body('newPassword').isLength({ min: 8 })], validate, ctrl.resetPassword);
// router.post('/refresh-token', ctrl.refreshToken);

// module.exports = router;


const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');
const { authLimiter } = require('../middleware/rateLimiter');


router.post('/register', authLimiter, [
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
], validate, ctrl.register);

router.post('/login', authLimiter, [
  body('email').isEmail(),
  body('password').notEmpty(),
], validate, ctrl.login);

router.post('/verify-otp', [
  body('email').isEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
], validate, ctrl.verifyOtp);

router.post('/forgot-password', [body('email').isEmail()], validate, ctrl.forgotPassword);
router.post('/reset-password', [body('token').notEmpty(), body('newPassword').isLength({ min: 8 })], validate, ctrl.resetPassword);
router.post('/refresh-token', ctrl.refreshToken);
router.post('/resend-otp', [body('email').isEmail()], validate, ctrl.resendOtp);

module.exports = router;