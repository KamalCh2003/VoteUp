const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

//user
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.get('/elections', adminController.getAllElections);
router.get('/elections/:id', adminController.getElectionById);
router.post('/elections', adminController.createElection);
router.put('/elections/:id', adminController.updateElection);
router.delete('/elections/:id', adminController.deleteElection);
//admin
router.get('/candidates', adminController.getAllCandidates);
router.get('/candidates/:id', adminController.getCandidateById);
router.post('/candidates', adminController.createCandidate);
router.put('/candidates/:id', adminController.updateCandidate);
router.delete('/candidates/:id', adminController.deleteCandidate);

module.exports = router;