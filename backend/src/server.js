/**
 * BuildMyHome - Server Entry Point
 * Main server initialization and configuration
 */

const app = require('./app');
const config = require('./config');
const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initializeSocket } = require('./sockets');
const logger = require('./utils/logger');

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('✓ Database connected successfully');

    // Connect to Redis (optional - graceful failure)
    try {
      await connectRedis();
      logger.info('✓ Redis connected successfully');
    } catch (redisError) {
      logger.warn('⚠ Redis connection failed - continuing without Redis', redisError.message);
    }

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                  BuildMyHome API Server                     ║
╠═══════════════════════════════════════════════════════════╣
║  Environment:     ${config.env.padEnd(40)}║
║  Server Running:  http://localhost:${config.port}${''.padEnd(26)}║
║  API Version:     ${config.apiVersion.padEnd(40)}║
║  Node Version:    ${process.version.padEnd(40)}║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // Initialize Socket.io
    initializeSocket(server);
    logger.info('✓ Socket.io initialized');

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', err);
      server.close(() => {
        logger.info('Server closed due to unhandled rejection');
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      server.close(() => {
        logger.info('Server closed due to uncaught exception');
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('✓ HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

