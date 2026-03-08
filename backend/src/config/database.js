/**
 * BuildMyHome - Database Configuration
 * MongoDB connection setup
 */

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB
 */
const connectDatabase = async () => {
  try {
    const options = {
      ...config.database.options,
      // Add write concern for production
      writeConcern: {
        w: config.env === 'production' ? 'majority' : 1,
        j: config.env === 'production',
        wtimeout: 5000,
      },
    };

    await mongoose.connect(config.database.uri, options);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Log queries in development
    if (config.env === 'development') {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        logger.debug(`MongoDB: ${collectionName}.${method}`, { query, doc });
      });
    }

    return mongoose.connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
  mongoose,
};

