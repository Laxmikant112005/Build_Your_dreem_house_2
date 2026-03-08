/**
 * BuildMyHome - Chat Controller
 * Request handlers for chat and messaging endpoints
 */

const chatService = require('./chat.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get all chats for current user
 */
const getChats = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  const result = await chatService.getChats(req.userId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  ApiResponse.ok(res, 'Chats retrieved successfully', result);
});

/**
 * Get messages for a specific chat
 */
const getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  const result = await chatService.getMessages(id, req.userId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  ApiResponse.ok(res, 'Messages retrieved successfully', result);
});

/**
 * Send a message to a chat
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { id: chatId } = req.params;
  const { content, messageType = 'text', attachments = [] } = req.body;
  
  if (!content || !content.trim()) {
    return ApiResponse.badRequest(res, 'Message content is required');
  }

  const message = await chatService.sendMessage(
    chatId,
    req.userId,
    content,
    messageType,
    attachments
  );

  ApiResponse.created(res, 'Message sent successfully', message);
});

/**
 * Create or get a chat with another user
 */
const createChat = asyncHandler(async (req, res) => {
  const { participantId, type = 'direct', bookingId } = req.body;
  
  if (!participantId) {
    return ApiResponse.badRequest(res, 'Participant ID is required');
  }

  const chat = await chatService.getOrCreateChat(
    req.userId,
    participantId,
    type,
    bookingId
  );

  ApiResponse.created(res, 'Chat created successfully', chat);
});

/**
 * Mark messages in a chat as read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await chatService.markMessagesAsRead(id, req.userId);
  ApiResponse.ok(res, 'Messages marked as read');
});

/**
 * Delete a chat
 */
const deleteChat = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await chatService.deleteChat(id, req.userId);
  ApiResponse.ok(res, 'Chat deleted successfully');
});

module.exports = {
  getChats,
  getMessages,
  sendMessage,
  createChat,
  markAsRead,
  deleteChat,
};

