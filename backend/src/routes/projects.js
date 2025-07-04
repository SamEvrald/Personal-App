
const express = require('express');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Project routes
router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.post('/', validate(schemas.project), projectController.create);
router.put('/:id', validate(schemas.project), projectController.update);
router.delete('/:id', projectController.delete);

// Subproject routes
router.post('/:id/subprojects', validate(schemas.subproject), projectController.createSubproject);
router.put('/:id/subprojects/:subprojectId', validate(schemas.subproject), projectController.updateSubproject);
router.delete('/:id/subprojects/:subprojectId', projectController.deleteSubproject);

module.exports = router;
