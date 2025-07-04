
const express = require('express');
const weeklyController = require('../controllers/weeklyController');
const authMiddleware = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Weekly review routes
router.get('/', weeklyController.getAll);
router.get('/:id', weeklyController.getById);
router.post('/', validate(schemas.weeklyReview), weeklyController.create);
router.put('/:id', validate(schemas.weeklyReview), weeklyController.update);
router.delete('/:id', weeklyController.delete);

module.exports = router;
