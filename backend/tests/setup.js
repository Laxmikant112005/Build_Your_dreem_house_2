/**
 * BuildMyHome - Test Setup
 * Jest configuration for API tests
 */

const mongoose = require('mongoose');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

// Connect to test database before all tests
beforeAll(async () => {
  try {
    // Use test database
    const testUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/buildmyhome_test';
    await mongoose.connect(testUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to test database');
  } catch (error) {
    console.error('✗ Failed to connect to test database:', error);
    throw error;
  }
});

// Disconnect and cleanup after all tests
afterAll(async () => {
  try {
    // Drop test database
    await mongoose.connection.dropDatabase();
    await disconnectDatabase();
    console.log('✓ Test database cleanup complete');
  } catch (error) {
    console.error('✗ Cleanup error:', error);
  }
});

// Clear all collections before each test
beforeEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  } catch (error) {
    console.error('Error clearing collections:', error);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

