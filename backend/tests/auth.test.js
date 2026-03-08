/**
 * BuildMyHome - API Integration Tests
 * Using Jest and Supertest
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/modules/user/user.model');
const jwt = require('jsonwebtoken');

// Test config
const BASE_URL = '/api/v1';
const TEST_PORT = 5000;

// Store tokens for tests
let accessToken = '';
let refreshToken = '';
let testUserId = '';
let testEngineerId = '';
let testDesignId = '';
let testBookingId = '';

// Test user data
const testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  firstName: 'Test',
  lastName: 'User'
};

const testEngineer = {
  email: `engineer${Date.now()}@example.com`,
  password: 'password123',
  firstName: 'Jane',
  lastName: 'Engineer',
  role: 'engineer'
};

// Helper function to generate test token
const generateTestToken = (userId, role = 'user') => {
  const config = require('../src/config');
  return jwt.sign({ id: userId }, config.jwt.secret, { expiresIn: '15m' });
};

describe('AUTHENTICATION API TESTS', () => {
  
  describe(`POST ${BASE_URL}/auth/register`, () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/auth/register`)
        .send(testUser)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(testUser.email);
      
      testUserId = response.body.data.user.id;
    });

    it('should fail with duplicate email', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/auth/register`)
        .send(testUser)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/auth/register`)
        .send({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('should fail with short password', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/auth/register`)
        .send({
          email: 'test2@example.com',
          password: '123',
          firstName: 'Test',
          lastName: 'User'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(422);
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/auth/register`)
        .send({})
        .expect('Content-Type', /json/);

      expect(response.status).toBe(422);
    });
  });

  describe(`POST ${BASE_URL}/auth/login`, () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/auth/login`)
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      
      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/auth/login`)
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/auth/login`)
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    it('should fail with missing fields', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/auth/login`)
        .send({})
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe(`POST ${BASE_URL}/auth/refresh-token`, () => {
    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/auth/refresh-token`)
        .send({ refreshToken })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/auth/refresh-token`)
        .send({ refreshToken: 'invalid-token' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    it('should fail without refresh token', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/auth/refresh-token`)
        .send({})
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe(`GET ${BASE_URL}/auth/me`, () => {
    it('should get current user successfully', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/auth/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/auth/me`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/auth/me`)
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe(`POST ${BASE_URL}/auth/logout`, () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/auth/logout`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

describe('USER API TESTS', () => {
  
  describe(`GET ${BASE_URL}/users/profile/me`, () => {
    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/users/profile/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('firstName');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/users/profile/me`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe(`PUT ${BASE_URL}/users/profile/me`, () => {
    it('should update user profile successfully', async () => {
      const response = await request(app)
        .put(`${BASE_URL}/users/profile/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'UpdatedName',
          phone: '+1234567890'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('UpdatedName');
    });

    it('should fail with invalid phone format', async () => {
      const response = await request(app)
        .put(`${BASE_URL}/users/profile/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ phone: 'invalid' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(422);
    });
  });
});

describe('ENGINEER API TESTS', () => {
  
  beforeAll(async () => {
    // Create a test engineer
    const engineer = await User.create({
      ...testEngineer,
      role: 'engineer',
      engineerProfile: {
        isVerified: true,
        verificationStatus: 'approved',
        specializations: ['Modern', 'Villa'],
        experience: 5
      }
    });
    testEngineerId = engineer._id.toString();
  });

  describe(`GET ${BASE_URL}/engineers`, () => {
    it('should get list of engineers', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/engineers`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.engineers)).toBe(true);
    });

    it('should filter engineers by city', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/engineers?city=NewYork`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should paginate engineers', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/engineers?page=1&limit=5`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  describe(`GET ${BASE_URL}/engineers/:id`, () => {
    it('should get engineer by valid ID', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/engineers/${testEngineerId}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.engineerProfile.isVerified).toBe(true);
    });

    it('should fail with invalid ID', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/engineers/invalid-id`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });

    it('should fail with non-existent engineer', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`${BASE_URL}/engineers/${fakeId}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });
  });
});

describe('DESIGN API TESTS', () => {
  const engineerToken = generateTestToken(testEngineerId, 'engineer');

  describe(`POST ${BASE_URL}/designs`, () => {
    it('should create design as engineer', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/designs`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({
          title: 'Test Design',
          description: 'A beautiful test design',
          specifications: {
            totalArea: 2500,
            floors: 2,
            bedrooms: 3,
            style: 'modern',
            constructionType: 'RCC'
          }
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      testDesignId = response.body.data.id;
    });

    it('should fail as regular user', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/designs`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Design',
          description: 'Test',
          specifications: {
            totalArea: 1000,
            floors: 1,
            style: 'modern',
            constructionType: 'RCC'
          }
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/designs`)
        .send({
          title: 'Test Design',
          description: 'Test'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe(`GET ${BASE_URL}/designs`, () => {
    it('should get list of designs', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/designs`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should filter designs by style', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/designs?style=modern`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });

    it('should filter designs by cost range', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/designs?minCost=1000000&maxCost=5000000`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });
  });

  describe(`GET ${BASE_URL}/designs/:id`, () => {
    it('should get design by valid ID', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/designs/${testDesignId}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Design');
    });

    it('should fail with invalid ID', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/designs/invalid-id`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });
});

describe('BOOKING API TESTS', () => {
  
  describe(`POST ${BASE_URL}/bookings`, () => {
    it('should create booking as user', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const response = await request(app)
        .post(`${BASE_URL}/bookings`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          engineerId: testEngineerId,
          type: 'consultation',
          scheduledDate: futureDate.toISOString().split('T')[0],
          scheduledTime: '10:00',
          duration: 60,
          meetingType: 'video',
          projectDetails: {
            landSize: 2000,
            budget: 5000000
          }
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      testBookingId = response.body.data.id;
    });

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/bookings`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });
  });

  describe(`GET ${BASE_URL}/bookings/my-bookings`, () => {
    it('should get user bookings', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/bookings/my-bookings`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/bookings/my-bookings`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });
});

describe('REVIEW API TESTS', () => {
  
  describe(`POST ${BASE_URL}/reviews`, () => {
    it('should create review as user', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          engineerId: testEngineerId,
          rating: 5,
          title: 'Great Service',
          comment: 'Excellent work, highly recommended!'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should fail with invalid rating', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/reviews`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          engineerId: testEngineerId,
          rating: 6,
          comment: 'Test'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(422);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/reviews`)
        .send({
          engineerId: testEngineerId,
          rating: 5,
          comment: 'Test'
        })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe(`GET ${BASE_URL}/reviews/engineer/:engineerId`, () => {
    it('should get engineer reviews', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/reviews/engineer/${testEngineerId}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

// Cleanup after all tests
afterAll(async () => {
  try {
    await User.deleteMany({});
    await mongoose.disconnect();
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});

