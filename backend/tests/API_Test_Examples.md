# BuildMyHome API Test Cases

## Base URL: http://localhost:5000/api/v1

---

## 1. AUTHENTICATION TESTS

### 1.1 POST /auth/register
**Success Case - Register new user**

**Request:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user_id_here",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isEmailVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1..."
  }
}
```

**Error Cases:**

| Test Case | Request Body | Expected Response |
|-----------|--------------|-------------------|
| Missing email | `{"password": "123456", "firstName": "John", "lastName": "Doe"}` | 400 - Email is required |
| Invalid email | `{"email": "invalid", "password": "123456", "firstName": "John", "lastName": "Doe"}` | 422 - Valid email is required |
| Short password | `{"email": "john@example.com", "password": "123", "firstName": "John", "lastName": "Doe"}` | 422 - Password must be at least 6 characters |
| Duplicate email | `{"email": "existing@example.com", "password": "password123", "firstName": "John", "lastName": "Doe"}` | 409 - Email already registered |
| Missing required fields | `{}` | 422 - Validation errors |

---

### 1.2 POST /auth/login
**Success Case - Login user**

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id_here",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1..."
  }
}
```

**Error Cases:**

| Test Case | Request Body | Expected Response |
|-----------|--------------|-------------------|
| Invalid credentials | `{"email": "wrong@example.com", "password": "wrongpass"}` | 401 - Invalid email or password |
| Wrong password | `{"email": "john@example.com", "password": "wrongpass"}` | 401 - Invalid email or password |
| Missing fields | `{}` | 400 - Validation errors |
| Deactivated account | (login with deactivated user) | 403 - Account is deactivated |

---

### 1.3 POST /auth/refresh-token
**Success Case - Refresh access token**

**Request:**
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1..."
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_access_token...",
    "refreshToken": "new_refresh_token..."
  }
}
```

---

## 2. USER TESTS

### 2.1 GET /users/profile (Protected)
**Success Case - Get own profile**

**Request:**
```http
GET /api/v1/users/profile/me
Authorization: Bearer <access_token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "user_id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": null,
    "phone": "+1234567890",
    "role": "user",
    "preferences": {
      "budgetMin": 0,
      "budgetMax": 0,
      "preferredStyles": [],
      "preferredLocations": []
    }
  }
}
```

**Error Cases:**

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| No token | (no Authorization header) | 401 - Access denied |
| Invalid token | `Authorization: Bearer invalid_token` | 401 - Invalid token |
| Expired token | (expired JWT) | 401 - Token expired |

---

### 2.2 PUT /users/profile (Protected)
**Success Case - Update profile**

**Request:**
```http
PUT /api/v1/users/profile/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "JohnUpdated",
  "lastName": "DoeUpdated",
  "phone": "+9876543210"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user_id",
    "firstName": "JohnUpdated",
    "lastName": "DoeUpdated",
    "phone": "+9876543210"
  }
}
```

**Error Cases:**

| Test Case | Request Body | Expected Response |
|-----------|--------------|-------------------|
| Invalid phone | `{"phone": "invalid"}` | 422 - Invalid phone format |
| First name too long | `{"firstName": "a".repeat(51)}` | 422 - First name cannot exceed 50 characters |

---

## 3. ENGINEER TESTS

### 3.1 GET /engineers
**Success Case - List engineers**

**Request:**
```http
GET /api/v1/engineers?page=1&limit=10
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Engineers retrieved successfully",
  "data": {
    "engineers": [
      {
        "id": "engineer_id",
        "firstName": "Jane",
        "lastName": "Smith",
        "avatar": null,
        "engineerProfile": {
          "specializations": ["Modern", "Villa"],
          "experience": 5,
          "rating": {
            "average": 4.5,
            "count": 20
          },
          "isVerified": true
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

### 3.2 GET /engineers/:id
**Success Case - Get engineer details**

**Request:**
```http
GET /api/v1/engineers/64f1a2b3c4d5e6f7a8b9c0d
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Engineer retrieved successfully",
  "data": {
    "id": "engineer_id",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@engineer.com",
    "engineerProfile": {
      "licenseNumber": "ENG123456",
      "specializations": ["Modern", "Villa"],
      "experience": 5,
      "serviceAreas": [
        {"location": "New York", "radiusKm": 50}
      ],
      "rating": {"average": 4.5, "count": 20},
      "isVerified": true
    },
    "stats": {
      "totalDesigns": 10,
      "totalBookings": 50,
      "completedBookings": 45
    }
  }
}
```

**Error Cases:**

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Engineer not found | GET /engineers/invalid_id | 404 - Engineer not found |
| Invalid ID format | GET /engineers/123 | 422 - Invalid ID |

---

## 4. DESIGN TESTS

### 4.1 POST /designs (Protected)
**Success Case - Create design**

**Request:**
```http
POST /api/v1/designs
Authorization: Bearer <engineer_token>
Content-Type: application/json

{
  "title": "Modern Villa Design",
  "description": "A beautiful modern villa with 3 bedrooms",
  "specifications": {
    "totalArea": 2500,
    "landWidth": 50,
    "landLength": 60,
    "floors": 2,
    "bedrooms": 3,
    "bathrooms": 2,
    "livingRooms": 2,
    "kitchen": 1,
    "garage": 1,
    "style": "modern",
    "constructionType": "RCC",
    "estimatedCost": 5000000,
    "estimatedDuration": 180
  },
  "location": {
    "city": "Mumbai",
    "state": "Maharashtra"
  },
  "tags": ["modern", "villa", "luxury"]
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Design created successfully",
  "data": {
    "id": "design_id",
    "title": "Modern Villa Design",
    "slug": "modern-villa-design-abc123",
    "status": "draft",
    "engineerId": "engineer_id"
  }
}
```

---

### 4.2 GET /designs
**Success Case - List designs**

**Request:**
```http
GET /api/v1/designs?page=1&limit=10&style=modern&minCost=1000000&maxCost=10000000
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Designs retrieved successfully",
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

### 4.3 GET /designs/:id
**Success Case - Get design details**

**Request:**
```http
GET /api/v1/designs/64f1a2b3c4d5e6f7a8b9c0d
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Design retrieved successfully",
  "data": {
    "id": "design_id",
    "title": "Modern Villa Design",
    "description": "A beautiful modern villa...",
    "specifications": {
      "totalArea": 2500,
      "floors": 2,
      "bedrooms": 3,
      "style": "modern"
    },
    "engineerId": {
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "metrics": {
      "views": 150,
      "likes": 25,
      "saves": 10
    }
  }
}
```

---

## 5. BOOKING TESTS

### 5.1 POST /bookings (Protected)
**Success Case - Create booking**

**Request:**
```http
POST /api/v1/bookings
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "engineerId": "64f1a2b3c4d5e6f7a8b9c0d",
  "designId": "64f1a2b3c4d5e6f7a8b9c0e",
  "type": "consultation",
  "scheduledDate": "2024-12-25",
  "scheduledTime": "10:00",
  "duration": 60,
  "meetingType": "video",
  "projectDetails": {
    "landSize": 2000,
    "budget": 5000000,
    "requirements": "Looking for a modern design"
  }
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking_id",
    "bookingId": "BMH-ABC12345",
    "userId": "user_id",
    "engineerId": "engineer_id",
    "type": "consultation",
    "status": "pending",
    "scheduledDate": "2024-12-25",
    "scheduledTime": "10:00"
  }
}
```

**Error Cases:**

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Booking own design | (user books their own engineer) | 400 - Cannot book your own engineer |
| Past date | scheduledDate: "2020-01-01" | 400 - Cannot book in the past |
| No availability | (slot already booked) | 400 - Time slot not available |

---

### 5.2 GET /bookings/my-bookings (Protected)
**Success Case - Get user's bookings**

**Request:**
```http
GET /api/v1/bookings/my-bookings?page=1&limit=10
Authorization: Bearer <user_token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "id": "booking_id",
      "bookingId": "BMH-ABC12345",
      "engineerId": {
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "status": "pending",
      "scheduledDate": "2024-12-25",
      "scheduledTime": "10:00"
    }
  ],
  "meta": {
    "pagination": {...}
  }
}
```

---

## 6. REVIEW TESTS

### 6.1 POST /reviews (Protected)
**Success Case - Create review**

**Request:**
```http
POST /api/v1/reviews
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "engineerId": "64f1a2b3c4d5e6f7a8b9c0d",
  "bookingId": "64f1a2b3c4d5e6f7a8b9c0e",
  "rating": 5,
  "title": "Excellent Service",
  "comment": "The engineer was very professional and delivered exactly what we wanted.",
  "pros": ["Professional", "Timely delivery", "Great communication"],
  "cons": ["Nothing"]
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": "review_id",
    "userId": "user_id",
    "engineerId": "engineer_id",
    "rating": 5,
    "title": "Excellent Service",
    "status": "pending"
  }
}
```

**Error Cases:**

| Test Case | Request | Expected Response |
|-----------|---------|-------------------|
| Invalid rating | rating: 6 | 422 - Rating must be between 1 and 5 |
| Duplicate review | (already reviewed same engineer) | 400 - Already reviewed |
| Self review | (user reviews themselves) | 400 - Cannot review yourself |

---

### 6.2 GET /reviews/engineer/:engineerId
**Success Case - Get engineer reviews**

**Request:**
```http
GET /api/v1/reviews/engineer/64f1a2b3c4d5e6f7a8b9c0d?page=1&limit=10
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Engineer reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "id": "review_id",
        "rating": 5,
        "title": "Excellent Service",
        "comment": "Great experience!",
        "userId": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "rating": {
      "average": 4.5,
      "count": 20
    },
    "pagination": {...}
  }
}
```

---

## 7. TESTING CHECKLIST

### Authentication
- [ ] Register with valid data
- [ ] Register with duplicate email
- [ ] Register with invalid email format
- [ ] Register with short password
- [ ] Register with missing required fields
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Login with non-existent email
- [ ] Login with missing fields
- [ ] Refresh token with valid token
- [ ] Refresh token with expired token
- [ ] Access protected route without token
- [ ] Access protected route with invalid token

### Users
- [ ] Get profile without authentication
- [ ] Get profile with valid token
- [ ] Update profile with valid data
- [ ] Update profile with invalid data
- [ ] Update profile of another user (should fail)

### Engineers
- [ ] List engineers with pagination
- [ ] List engineers with filters
- [ ] Get engineer by valid ID
- [ ] Get engineer by invalid ID

### Designs
- [ ] Create design as user (should fail)
- [ ] Create design as engineer
- [ ] Create design with invalid data
- [ ] List designs with filters
- [ ] Get design by valid ID
- [ ] Get design by invalid ID

### Bookings
- [ ] Create booking as engineer (should fail)
- [ ] Create booking as user
- [ ] Create booking with past date (should fail)
- [ ] List user's bookings
- [ ] List engineer's bookings

### Reviews
- [ ] Create review as engineer (should fail)
- [ ] Create review as user
- [ ] Create duplicate review (should fail)
- [ ] Get engineer reviews

