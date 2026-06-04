const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);
router.get('/me', ctrl.getProfile);
router.put('/me', ctrl.updateProfile);
router.put('/me/password', ctrl.changePassword);
router.put('/me/avatar', upload.single('avatar'), ctrl.uploadAvatar);

module.exports = router;