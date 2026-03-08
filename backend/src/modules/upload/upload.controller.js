/**
 * BuildMyHome - Upload Controller
 * Request handlers for file upload endpoints
 */

const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const config = require('../../config');
const logger = require('../../utils/logger');

// Mock upload function - in production, use multer with S3
const uploadToStorage = async (file, folder) => {
  // In production, this would upload to AWS S3, Cloudinary, or local storage
  // For now, return a mock URL
  const filename = `${Date.now()}-${file.originalname}`;
  return {
    url: `${config.apiUrl}/uploads/${folder}/${filename}`,
    filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  };
};

/**
 * Upload image
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return ApiResponse.badRequest(res, 'No image file provided');
  }

  // Validate file type
  const allowedTypes = config.upload.allowedImageTypes;
  if (!allowedTypes.includes(req.file.mimetype)) {
    return ApiResponse.badRequest(res, 'Invalid file type. Allowed: jpeg, png, gif, webp');
  }

  // Validate file size
  const maxSize = config.upload.maxFileSize;
  if (req.file.size > maxSize) {
    return ApiResponse.badRequest(res, `File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  const result = await uploadToStorage(req.file, 'images');

  ApiResponse.created(res, 'Image uploaded successfully', {
    ...result,
    thumbnailUrl: result.url, // In production, generate thumbnail
  });
});

/**
 * Upload multiple images
 */
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return ApiResponse.badRequest(res, 'No image files provided');
  }

  const allowedTypes = config.upload.allowedImageTypes;
  const maxSize = config.upload.maxFileSize;
  const maxImages = config.upload.maxImages;

  if (req.files.length > maxImages) {
    return ApiResponse.badRequest(res, `Maximum ${maxImages} images allowed`);
  }

  const results = await Promise.all(
    req.files
      .filter(file => allowedTypes.includes(file.mimetype) && file.size <= maxSize)
      .map(file => uploadToStorage(file, 'images'))
  );

  ApiResponse.created(res, 'Images uploaded successfully', results);
});

/**
 * Upload file (document, CAD, etc.)
 */
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return ApiResponse.badRequest(res, 'No file provided');
  }

  // Determine folder based on file type
  let folder = 'documents';
  const allowedTypes = [
    ...config.upload.allowedDocumentTypes,
    ...config.upload.allowedCadTypes,
    ...config.upload.allowed3DTypes,
  ];

  if (config.upload.allowedImageTypes.includes(req.file.mimetype)) {
    return ApiResponse.badRequest(res, 'Use /uploads/image for images');
  }

  if (!allowedTypes.includes(req.file.mimetype)) {
    return ApiResponse.badRequest(res, 'Invalid file type');
  }

  if (config.upload.allowedCadTypes.includes(req.file.mimetype)) {
    folder = 'cad';
  } else if (config.upload.allowed3DTypes.includes(req.file.mimetype)) {
    folder = '3d';
  }

  const result = await uploadToStorage(req.file, folder);

  ApiResponse.created(res, 'File uploaded successfully', result);
});

/**
 * Upload design files (floor plans, documents)
 */
const uploadDesignFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return ApiResponse.badRequest(res, 'No file provided');
  }

  const { type } = req.body; // floorPlan, cadFile, document, model3d
  
  let folder = 'documents';
  if (type === 'floorPlan') folder = 'floor-plans';
  else if (type === 'cadFile') folder = 'cad';
  else if (type === 'model3d') folder = '3d';
  else if (type === 'document') folder = 'documents';

  const result = await uploadToStorage(req.file, folder);

  ApiResponse.created(res, 'Design file uploaded successfully', result);
});

/**
 * Delete uploaded file (from storage)
 */
const deleteFile = asyncHandler(async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return ApiResponse.badRequest(res, 'File URL is required');
  }

  // In production, implement actual deletion from S3/storage
  logger.info(`File deletion requested: ${url}`);

  ApiResponse.ok(res, 'File deleted successfully');
});

module.exports = {
  uploadImage,
  uploadImages,
  uploadFile,
  uploadDesignFile,
  deleteFile,
};

