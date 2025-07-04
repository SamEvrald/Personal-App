
const express = require('express');
const dailyController = require('../controllers/dailyController');
const authMiddleware = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Daily execution routes
router.get('/', dailyController.getAll);
router.get('/:id', dailyController.getById);
router.post('/', 
  upload.array('proofFiles', 5), 
  handleUploadError,
  // validate(schemas.dailyEntry), 
  dailyController.create
);
router.put('/:id', 
  upload.array('proofFiles', 5), 
  handleUploadError,
  validate(schemas.dailyEntry), 
  dailyController.update
);
router.delete('/:id', dailyController.delete);

// Proof file routes
router.delete('/:id/files/:fileId', dailyController.deleteProofFile);

module.exports = router;
