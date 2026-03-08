/**
 * BuildMyHome - Upload Routes
 */

const express = require('express');
const router = express.Router();
const uploadController = require('./upload.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { uploadImage, uploadImages, uploadFile, uploadDesignFile } = require('../../config/multer');
const { validate } = require('../../middleware/validation.middleware');
const { body } = require('express-validator');
const { ROLE } = require('../../constants/roles');

// Public routes for image uploads
router.post('/image', uploadImage, uploadController.uploadImage);
router.post('/images', uploadImages, uploadController.uploadImages);
router.post('/file', uploadFile, uploadController.uploadFile);

// Protected routes for design files
router.post('/design-file', authenticate, uploadDesignFile, uploadController.uploadDesignFile);

// Delete file (admin only)
router.delete('/file', authenticate, authorize(ROLE.ADMIN), uploadController.deleteFile);

module.exports = router;

