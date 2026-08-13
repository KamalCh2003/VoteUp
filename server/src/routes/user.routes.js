const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, userController.updateProfile);
router.post('/me/change-password', authenticate, userController.changePassword);
router.post('/me/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);
router.get('/me/votes', authenticate, userController.getVoteHistory);
router.get('/me/notifications', authenticate, userController.getNotifications);
router.get('/me/notifications/unread-count', authenticate, userController.getUnreadNotificationCount);
router.patch('/me/notifications/:id/read', authenticate, userController.markNotificationRead);
router.patch('/me/notifications/mark-all-read', authenticate, userController.markAllNotificationsRead);
router.delete('/me/notifications/clear-all', authenticate, userController.clearAllNotifications);
router.get('/me/payments', authenticate, userController.getPayments);

router.get('/me/bookmarks', authenticate, userController.getBookmarks);
router.post('/me/bookmarks/:electionId', authenticate, userController.addBookmark);
router.delete('/me/bookmarks/:electionId', authenticate, userController.removeBookmark);

module.exports = router;