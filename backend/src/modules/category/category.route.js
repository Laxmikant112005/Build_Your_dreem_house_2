/**
 * BuildMyHome - Category Routes
 * API routes for category endpoints
 */

const express = require('express');
const router = express.Router();

const categoryController = require('./category.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { ROLE } = require('../../constants/roles');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/hierarchy', categoryController.getCategoryHierarchy);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/path', categoryController.getCategoryPath);
router.get('/:id/subcategories', categoryController.getSubcategories);
router.get('/:id/designs', categoryController.getCategoryDesigns);

// Admin routes
router.post('/', authenticate, authorize(ROLE.ADMIN), categoryController.createCategory);
router.put('/:id', authenticate, authorize(ROLE.ADMIN), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize(ROLE.ADMIN), categoryController.deleteCategory);

module.exports = router;

