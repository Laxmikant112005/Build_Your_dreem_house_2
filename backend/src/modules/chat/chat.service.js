/**
 * BuildMyHome - Chat Service
 */

const Conversation = require('./conversation.model');
const Message = require('./message.model');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

const chatService = {
  /**
   * Get or create conversation
   */
  async getConversation(participants) {
    // Sort to ensure unique conversation
    const sorted = [...participants].sort();
    const query = {
      $or: [
        { 'participants.0': sorted[0], 'participants.1': sorted[1] },
        { 'participants.1': sorted[0], 'participants.0': sorted[1] },
      ],
    };

    let conversation = await Conversation.findOne(query);
    if (!conversation) {
      conversation = await Conversation.create({ participants });
    }
    return conversation;
  },

  /**
   * Save message to DB
   */
  async saveMessage(data) {
    const { conversationId, senderId, receiverId, message, messageType = 'text', fileUrl } = data;

    const savedMessage = await Message.create({
      conversationId,
      senderId,
      receiverId,
      message,
      messageType,
      fileUrl,
    });

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: savedMessage._id,
    });

    return savedMessage.populate('senderId', 'firstName avatar');
  },

  /**
   * Get conversation messages
   */
  async getMessages(conversationId, options = {}) {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'firstName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return messages.reverse(); // Oldest first
  },

  /**
   * Mark messages as read
   */
  async markMessagesRead(conversationId, userId) {
    await Message.updateMany(
      { 
        conversationId, 
        receiverId: userId,
        isRead: false 
      },
      { isRead: true }
    );
  },

  /**
   * Get user conversations
   */
  async getConversations(userId, options = {}) {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'firstName avatar role')
      .populate('lastMessage', 'message createdAt')
      .sort({ updatedAt: -1 });

    return conversations.map(conv => ({
      ...conv.toObject(),
      unreadCount: conv.unreadCount?.get(userId.toString()) || 0,
    }));
  },
};

module.exports = chatService;

