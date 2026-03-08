/**
 * BuildMyHome - Multer Configuration
 * File upload configuration with local and S3 support
 */

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('./index');

// Configure storage
const storage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (config.upload.allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${config.upload.allowedImageTypes.join(', ')}`), false);
  }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = [
    ...config.upload.allowedDocumentTypes,
    ...config.upload.allowedCadTypes,
    ...config.upload.allowed3DTypes,
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type`), false);
  }
};

// Create multer upload instances
const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

const uploadImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: config.upload.maxImages,
  },
});

const uploadFile = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

// Export configured upload middleware
module.exports = {
  uploadImage: uploadImage.single('image'),
  uploadImages: uploadImages.array('images', config.upload.maxImages),
  uploadFile: uploadFile.single('file'),
  uploadDesignFile: uploadFile.single('file'),
};

