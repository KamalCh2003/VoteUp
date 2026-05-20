const router = require('express').Router();
const passport = require('../config/passport');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authenticate, authController.getMe);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.googleCallback);

module.exports = router;