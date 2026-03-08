/**
 * BuildMyHome - Socket.io Initialization
 * Real-time functionality for chat and notifications
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

let io;

/**
 * Initialize Socket.io server
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining chat rooms
    socket.on('join-chat', (chatId) => {
      socket.join(`chat:${chatId}`);
      logger.info(`User ${socket.userId} joined chat ${chatId}`);
    });

    // Handle leaving chat rooms
    socket.on('leave-chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
      logger.info(`User ${socket.userId} left chat ${chatId}`);
    });

    // Handle sending messages
    socket.on('send-message', (data) => {
      const { chatId, message } = data;
      io.to(`chat:${chatId}`).emit('new-message', {
        chatId,
        message,
        senderId: socket.userId,
        timestamp: new Date(),
      });
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit('user-typing', {
        chatId,
        userId: socket.userId,
      });
    });

    // Handle read receipts
    socket.on('mark-read', (data) => {
      const { chatId, messageId } = data;
      io.to(`chat:${chatId}`).emit('message-read', {
        chatId,
        messageId,
        readBy: socket.userId,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

/**
 * Get Socket.io instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Send notification to specific user
 */
const sendToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Send to all connected clients
 */
const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  sendToUser,
  broadcast,
};

