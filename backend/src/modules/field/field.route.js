/**
 * BuildMyHome - Field Routes
 */

const express = require('express');
const authenticate = require('../../middleware/auth.middleware').authenticate;
const fieldController = require('./field.controller');

const router = express.Router();

router.post('/save', authenticate, fieldController.saveField);
router.get('/', authenticate, fieldController.getMyFields);
router.get('/:id', authenticate, fieldController.getField);
router.put('/:id', authenticate, fieldController.updateField);
router.delete('/:id', authenticate, fieldController.deleteField);

module.exports = router;

