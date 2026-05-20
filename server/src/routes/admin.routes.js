const router = require('express').Router();
const adminController = require('../controllers/admin.controller.js');
const authenticate = require('../middleware/authenticate.js');
const authorize = require('../middleware/authorize.js');
const upload = require('../middleware/upload.js');
const statsController = require('../controllers/stats.controller');

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/audit-logs', adminController.getAuditLogs);
router.post('/candidates', upload.single('image'), adminController.createCandidate);
router.get('/stats/dashboard', statsController.getDashboardStats);

module.exports = router;