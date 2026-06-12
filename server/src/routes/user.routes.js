const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, userController.updateProfile);
router.post('/me/change-password', authenticate, userController.changePassword);
router.post('/me/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);
router.get('/me/votes', authenticate, userController.getVoteHistory);

module.exports = router;