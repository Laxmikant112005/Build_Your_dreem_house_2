/**
 * BuildMyHome - Redis Configuration
 * Redis client setup for caching and session management
 */

const Redis = require('ioredis');
const config = require('./index');
const logger = require('../utils/logger');

let redisClient = null;

/**
 * Connect to Redis
 */
const connectRedis = async () => {
  try {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      logger.info('Redis: Connected to Redis server');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis: Connection error', err.message);
    });

    redisClient.on('ready', () => {
      logger.info('Redis: Client ready');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Redis: Failed to connect', error.message);
    throw error;
  }
};

/**
 * Get Redis client
 */
const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

/**
 * Disconnect from Redis
 */
const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis: Disconnected');
  }
};

/**
 * Cache operations
 */
const cache = {
  /**
   * Set cache value
   */
  async set(key, value, ttlSeconds = 3600) {
    try {
      const serialized = JSON.stringify(value);
      await redisClient.setex(key, ttlSeconds, serialized);
      return true;
    } catch (error) {
      logger.error('Redis cache set error:', error.message);
      return false;
    }
  },

  /**
   * Get cache value
   */
  async get(key) {
    try {
      const value = await redisClient.get(key);
      if (!value) return null;
      return JSON.parse(value);
    } catch (error) {
      logger.error('Redis cache get error:', error.message);
      return null;
    }
  },

  /**
   * Delete cache value
   */
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Redis cache delete error:', error.message);
      return false;
    }
  },

  /**
   * Delete cache by pattern
   */
  async delByPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error('Redis cache delete by pattern error:', error.message);
      return false;
    }
  },

  /**
   * Increment counter
   */
  async incr(key) {
    try {
      return await redisClient.incr(key);
    } catch (error) {
      logger.error('Redis increment error:', error.message);
      return null;
    }
  },

  /**
   * Set expiration
   */
  async expire(key, seconds) {
    try {
      return await redisClient.expire(key, seconds);
    } catch (error) {
      logger.error('Redis expire error:', error.message);
      return false;
    }
  },
};

module.exports = {
  connectRedis,
  disconnectRedis,
  getRedisClient,
  cache,
};

