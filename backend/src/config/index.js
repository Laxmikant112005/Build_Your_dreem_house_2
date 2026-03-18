/**
 * BuildMyHome - Main Configuration
 * Central configuration management for the backend
 */

require('dotenv').config();

module.exports = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  apiVersion: process.env.API_VERSION || 'v1',
  apiUrl: process.env.API_URL || 'http://localhost:5000/api/v1',

  // Database
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/buildmyhome',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    expiresIn: process.env.JWT_EXPIRE_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE_IN || '7d',
  },

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || 'buildmyhome-uploads',
    endpoint: process.env.AWS_S3_ENDPOINT,
  },

  // Email
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    from: process.env.EMAIL_FROM || 'noreply@buildmyhome.com',
    fromName: process.env.EMAIL_FROM_NAME || 'BuildMyHome',
  },

  // Razorpay
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },

  // Client URL
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB
    maxImages: parseInt(process.env.MAX_IMAGES_PER_UPLOAD) || 10,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocumentTypes: ['application/pdf'],
    allowedCadTypes: ['application/dwg', 'application/x-dwg', 'application/autocad_dwg'],
    allowed3DTypes: ['model/gltf-binary', 'model/gltf+json', 'application/fbx'],
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
  },

  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Cache TTL (in seconds)
  cache: {
    short: 300,    // 5 minutes
    medium: 1800,  // 30 minutes
    long: 3600,    // 1 hour
    veryLong: 86400, // 24 hours
  },
};

