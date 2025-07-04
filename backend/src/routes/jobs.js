
const express = require('express');
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Job application routes
router.get('/', jobController.getAll);
router.get('/stats', jobController.getStats);
router.get('/:id', jobController.getById);
router.post('/', validate(schemas.jobApplication), jobController.create);
router.put('/:id', validate(schemas.jobApplication), jobController.update);
router.delete('/:id', jobController.delete);

// Job activity routes
router.post('/:id/activities', validate(schemas.jobActivity), jobController.addActivity);
router.put('/:id/activities/:activityId', validate(schemas.jobActivity), jobController.updateActivity);
router.delete('/:id/activities/:activityId', jobController.deleteActivity);

module.exports = router;
