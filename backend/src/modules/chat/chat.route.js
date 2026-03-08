/**
 * BuildMyHome - Chat Routes
 */

const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { body, param } = require('express-validator');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createChatValidation = [
  body('participantId').isMongoId().withMessage('Valid participant ID is required'),
  body('type').optional().isIn(['direct', 'group', 'booking']),
  body('bookingId').optional().isMongoId(),
];

const sendMessageValidation = [
  body('content').notEmpty().trim().withMessage('Message content is required'),
  body('messageType').optional().isIn(['text', 'image', 'file']),
  body('attachments').optional().isArray(),
];

// Chat routes
router.get('/', chatController.getChats);
router.post('/', createChatValidation, validate, chatController.createChat);
router.get('/:id/messages', param('id').isMongoId(), validate, chatController.getMessages);
router.post('/:id/messages', param('id').isMongoId(), sendMessageValidation, validate, chatController.sendMessage);
router.put('/:id/read', param('id').isMongoId(), validate, chatController.markAsRead);
router.delete('/:id', param('id').isMongoId(), validate, chatController.deleteChat);

module.exports = router;

