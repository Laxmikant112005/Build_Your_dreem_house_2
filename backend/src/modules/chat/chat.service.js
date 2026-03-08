/**
 * BuildMyHome - Chat Service
 * Business logic for chat and messaging operations
 */

const mongoose = require('mongoose');
const ApiError = require('../../utils/ApiError');
const { getIO } = require('../../sockets');
const logger = require('../../utils/logger');

// Chat schema
const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  type: {
    type: String,
    enum: ['direct', 'group', 'booking'],
    default: 'direct',
  },
  name: {
    type: String,
  },
  lastMessage: {
    message: String,
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sentAt: Date,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Message schema
const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text',
  },
  content: {
    type: String,
    required: true,
  },
  attachments: [{
    url: String,
    name: String,
    type: String,
    size: Number,
  }],
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: Date,
  }],
}, {
  timestamps: true,
});

// Create models
const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

class ChatService {
  /**
   * Get or create a chat between two users
   */
  async getOrCreateChat(userId1, userId2, type = 'direct', bookingId = null) {
    // Find existing direct chat
    const existingChat = await Chat.findOne({
      type,
      participants: { $all: [userId1, userId2], $size: 2 },
      ...(bookingId && { bookingId }),
    });

    if (existingChat) {
      return existingChat;
    }

    // Create new chat
    const chat = await Chat.create({
      participants: [userId1, userId2],
      type,
      bookingId,
    });

    return chat;
  }

  /**
   * Get chats for a user
   */
  async getChats(userId, options = {}) {
    const { page = 1, limit = 20 } = options;

    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      Chat.find({
        participants: userId,
        isActive: true,
      })
        .populate('participants', 'firstName lastName avatar role')
        .populate('bookingId', 'bookingId type status')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Chat.countDocuments({
        participants: userId,
        isActive: true,
      }),
    ]);

    // Add unread count for current user
    const chatsWithUnread = chats.map(chat => {
      const chatObj = chat.toObject();
      chatObj.unreadCount = chat.unreadCount?.get(userId.toString()) || 0;
      return chatObj;
    });

    return {
      chats: chatsWithUnread,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get messages for a chat
   */
  async getMessages(chatId, userId, options = {}) {
    const { page = 1, limit = 50 } = options;

    // Verify user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new ApiError(404, 'Chat not found');
    }

    if (!chat.participants.some(p => p.toString() === userId.toString())) {
      throw new ApiError(403, 'You are not a participant in this chat');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ chatId })
        .populate('senderId', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ chatId }),
    ]);

    // Mark messages as read
    await this.markMessagesAsRead(chatId, userId);

    return {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Send a message
   */
  async sendMessage(chatId, senderId, content, messageType = 'text', attachments = []) {
    // Verify sender is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new ApiError(404, 'Chat not found');
    }

    if (!chat.participants.some(p => p.toString() === senderId.toString())) {
      throw new ApiError(403, 'You are not a participant in this chat');
    }

    // Create message
    const message = await Message.create({
      chatId,
      senderId,
      messageType,
      content,
      attachments,
      readBy: [{ userId: senderId, readAt: new Date() }],
    });

    // Populate sender info
    await message.populate('senderId', 'firstName lastName avatar');

    // Update chat's last message
    chat.lastMessage = {
      message: content.substring(0, 100),
      senderId,
      sentAt: new Date(),
    };

    // Increment unread count for other participants
    chat.participants.forEach(participantId => {
      if (participantId.toString() !== senderId.toString()) {
        const currentCount = chat.unreadCount?.get(participantId.toString()) || 0;
        chat.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });

    await chat.save();

    // Send real-time notification via Socket.io
    this.sendRealTimeMessage(chatId, message, chat.participants);

    return message;
  }

  /**
   * Send real-time message via Socket.io
   */
  sendRealTimeMessage(chatId, message, participants) {
    try {
      const io = getIO();
      if (io) {
        io.to(`chat:${chatId}`).emit('new-message', message);
        
        // Also notify each participant's personal room
        participants.forEach(participantId => {
          io.to(`user:${participantId}`).emit('chat-update', {
            chatId,
            lastMessage: message,
          });
        });
      }
    } catch (error) {
      logger.warn('Socket.io not available for real-time message');
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId, userId) {
    const chat = await Chat.findById(chatId);
    if (!chat) return;

    // Update message read status
    await Message.updateMany(
      {
        chatId,
        'readBy.userId': { $ne: userId },
      },
      {
        $push: { readBy: { userId, readAt: new Date() } },
      }
    );

    // Reset unread count for user
    if (chat.unreadCount) {
      chat.unreadCount.set(userId.toString(), 0);
      await chat.save();
    }
  }

  /**
   * Start a chat from a booking
   */
  async createBookingChat(booking, userId, engineerId) {
    const chat = await this.getOrCreateChat(userId, engineerId, 'booking', booking._id);
    return chat;
  }

  /**
   * Get or create chat for booking
   */
  async getBookingChat(bookingId) {
    const chat = await Chat.findOne({ bookingId })
      .populate('participants', 'firstName lastName avatar');
    
    return chat;
  }

  /**
   * Delete chat (soft delete)
   */
  async deleteChat(chatId, userId) {
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      throw new ApiError(404, 'Chat not found');
    }

    // Check if user is participant
    if (!chat.participants.some(p => p.toString() === userId.toString())) {
      throw new ApiError(403, 'You are not a participant in this chat');
    }

    chat.isActive = false;
    await chat.save();

    return true;
  }
}

module.exports = new ChatService();

