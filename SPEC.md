# BuildMyHome - Backend Architecture Specification

## Project Overview

**Project Name:** BuildMyHome  
**Project Type:** MERN Stack Web Application  
**Core Functionality:** A platform connecting homeowners with engineers to browse, upload, and book house design services  
**Target Users:** Homeowners (users), Architects/Engineers, Administrators  
**Initial Scale:** 1K-10K users, 200-500 engineers (designed for 100K+)

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Backend Modules](#2-backend-modules)
3. [Database Schema](#3-database-schema)
4. [API Structure](#4-api-structure)
5. [Folder Structure](#5-folder-structure)

---

## 1. System Architecture

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Web App   │  │ Mobile App  │  │   PWA       │  │  Admin Panel│        │
│  │  (React)    │  │ (React Native)│ │  (React)    │  │  (React)    │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼───────────────┘
          │                │                │                │
          └────────────────┴────────┬───────┴────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        API Gateway (Nginx/Express)                   │   │
│  │  • Rate Limiting    • Authentication    • Request Routing            │   │
│  │  • Logging          • SSL/TLS           • Load Balancing             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   AUTH SERVICE      │  │   DESIGN SERVICE    │  │  BOOKING SERVICE    │
│   (Express + JWT)   │  │   (Express + GridFS) │  │  (Express + Socket) │
│                     │  │                     │  │                     │
│  • /api/auth/*      │  │  • /api/designs/*   │  │  • /api/bookings/*  │
│  • User Mgmt        │  │  • File Upload      │  │  • Scheduling       │
│  • Roles (RBAC)     │  │  • Search/Filter    │  │  • Status Tracking  │
│  • Social Login     │  │  • Categories       │  │  • Conflict Check   │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
          │                           │                           │
          └───────────────────────────┼───────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RECOMMENDATION ENGINE LAYER                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Recommendation Service                          │   │
│  │  • Content-Based Filtering    • User Behavior Tracking             │   │
│  │  • Rule-Based Scoring         • Popularity & Ratings                │   │
│  │  • Budget/Style Matching      • Location-Based Suggestions         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   MongoDB   │  │  Redis      │  │    S3/      │  │   Socket    │
│  │  Primary    │  │  Cache      │  │  Object     │  │   Server    │
│  │  Database  │  │  Session    │  │  Storage    │  │  (Real-time)│
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| API Gateway | Nginx + Express | Load balancing, SSL termination, routing |
| Backend Framework | Node.js + Express | REST API server |
| Database | MongoDB (Atlas/Docker) | Primary data store |
| Caching | Redis | Session, API cache, rate limiting |
| File Storage | AWS S3 / DigitalOcean Spaces | Design files, images, 3D models |
| Real-time | Socket.io | Chat, notifications |
| Authentication | JWT + bcrypt | Stateless auth with refresh tokens |
| Validation | Joi / Zod | Request validation |
| Job Queue | Bull + Redis | Background jobs (thumbnails, emails) |
| Logging | Winston + ELK Stack | Centralized logging |

### 1.3 Scalability Design

```
                        ┌─────────────────────┐
                        │   Load Balancer     │
                        │   (Nginx/HAProxy)   │
                        └──────────┬──────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
            ▼                      ▼                      ▼
    ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
    │  API Server 1 │      │  API Server 2 │      │  API Server 3 │
    │   (Node.js)   │      │   (Node.js)   │      │   (Node.js)   │
    └───────┬───────┘      └───────┬───────┘      └───────┬───────┘
            │                      │                      │
            └──────────────────────┼──────────────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
            ▼                      ▼                      ▼
    ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
    │   MongoDB     │      │     Redis     │      │      S3       │
    │   Replica     │      │    Cluster    │      │   Buckets     │
    │   Set         │      │               │      │               │
    └───────────────┘      └───────────────┘      └───────────────┘
```

---

## 2. Backend Modules

### 2.1 Module Overview

```
Backend Services/
├── auth-service          # Authentication & Authorization
├── user-service         # User management
├── engineer-service     # Engineer profiles & availability
├── design-service       # House design management
├── booking-service      # Booking & scheduling
├── recommendation-service # AI/Rule-based recommendations
├── notification-service # Push notifications, emails, SMS
├── chat-service         # Real-time messaging
├── upload-service       # File handling & processing
├── search-service       # Advanced search & filtering
├── admin-service        # Admin dashboard & management
└── payment-service     # Payment integration (future)
```

### 2.2 Module Details

#### 2.2.1 Auth Service
- **Responsibility:** Handle all authentication operations
- **Features:**
  - Email/password registration and login
  - JWT token generation (access + refresh tokens)
  - Token refresh mechanism
  - Password reset via email
  - Email verification
  - Role-based access control (RBAC)
  - Session management
  - Account lockout after failed attempts

#### 2.2.2 User Service
- **Responsibility:** Manage user profiles and preferences
- **Features:**
  - User CRUD operations
  - Profile management (avatar, bio, preferences)
  - Saved/favorite designs
  - Booking history
  - User preferences (budget, style, location)
  - Activity tracking

#### 2.2.3 Engineer Service
- **Responsibility:** Manage engineer profiles and availability
- **Features:**
  - Engineer profile creation and verification
  - Portfolio management
  - Availability schedule management
  - Service area (location radius)
  - Specializations and expertise
  - Ratings and reviews
  - Performance metrics

#### 2.2.4 Design Service
- **Responsibility:** Manage house design uploads and catalog
- **Features:**
  - Multi-file upload (images, PDFs, CAD, 3D models)
  - Design metadata (title, description, specs)
  - Categories and tags
  - Design versioning
  - Approval workflow (admin审核)
  - Thumbnail generation
  - Design search and filtering
  - Popular designs tracking

#### 2.2.5 Booking Service
- **Responsibility:** Handle booking and scheduling
- **Features:**
  - Create booking requests
  - Availability checking
  - Double-booking prevention
  - Booking status workflow (Pending → Confirmed → Completed/Cancelled)
  - Rescheduling and cancellation
  - Calendar integration (future)
  - Booking reminders

#### 2.2.6 Recommendation Service
- **Responsibility:** Provide personalized design recommendations
- **Features:**
  - Content-based filtering (budget, style, size)
  - Collaborative filtering (user behavior)
  - Rule-based scoring algorithm
  - Popular designs trending
  - Location-based suggestions
  - Similar designs detection
  - A/B testing support for recommendations

#### 2.2.7 Notification Service
- **Responsibility:** Handle all notifications
- **Features:**
  - In-app notifications
  - Email notifications (Nodemailer)
  - Push notifications (Firebase)
  - SMS notifications (Twilio - future)
  - Notification preferences
  - Batch notifications for admins

#### 2.2.8 Chat Service
- **Responsibility:** Real-time messaging between users and engineers
- **Features:**
  - WebSocket-based messaging
  - Chat rooms per booking
  - Message history
  - Read receipts
  - Typing indicators
  - File sharing in chat

#### 2.2.9 Upload Service
- **Responsibility:** Handle file uploads and processing
- **Features:**
  - Multi-part file upload
  - File type validation
  - File size limits
  - Image resizing and optimization
  - Thumbnail generation
  - Virus scanning
  - CDN integration

#### 2.2.10 Search Service
- **Responsibility:** Advanced search and filtering
- **Features:**
  - Full-text search (Elasticsearch - future, MongoDB Atlas Search - initial)
  - Faceted search
  - Filters (price, style, size, location)
  - Autocomplete suggestions
  - Search analytics

#### 2.2.11 Admin Service
- **Responsibility:** Admin dashboard and management
- **Features:**
  - User management
  - Engineer verification
  - Content moderation
  - Analytics dashboard
  - Report management
  - System settings

---

## 3. Database Schema

### 3.1 MongoDB Collections

```
Database: buildmyhome
├── users
├── engineers
├── designs
├── bookings
├── reviews
├── notifications
├── chats
├── messages
├── categories
├── favorites
├── recommendations
└── analytics
```

### 3.2 Schema Definitions

#### 3.2.1 User Schema (`users`)

```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  firstName: String,
  lastName: String,
  avatar: String (URL),
  phone: String,
  role: String (enum: ['user', 'engineer', 'admin']),
  isEmailVerified: Boolean,
  isActive: Boolean,
  preferences: {
    budgetMin: Number,
    budgetMax: Number,
    preferredStyles: [String],
    preferredLocations: [String],
    landSize: Number,
    desiredRooms: Number
  },
  // For engineers only
  engineerProfile: {
    isVerified: Boolean,
    verificationStatus: String (enum: ['pending', 'approved', 'rejected']),
    licenseNumber: String,
    specializations: [String],
    experience: Number,
    serviceAreas: [{
      location: String,
      radiusKm: Number
    }],
    availability: [{
      dayOfWeek: Number (0-6),
      startTime: String,
      endTime: String
    }],
    portfolio: [{
      title: String,
      description: String,
      images: [String],
      completedDate: Date
    }],
    rating: {
      average: Number,
      count: Number
    }
  },
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
  refreshToken: String
}
```

**Indexes:**
- `email` (unique)
- `role`
- `isActive`
- `createdAt`

#### 3.2.2 Design Schema (`designs`)

```javascript
{
  _id: ObjectId,
  title: String,
  slug: String (unique),
  description: String,
  engineerId: ObjectId (ref: 'users'),
  category: ObjectId (ref: 'categories'),
  // Specifications
  specifications: {
    totalArea: Number,           // in sq ft
    landWidth: Number,
    landLength: Number,
    floors: Number,
    bedrooms: Number,
    bathrooms: Number,
    livingRooms: Number,
    kitchen: Number,
    garage: Number,
    style: String (enum: ['modern', 'traditional', 'villa', 'duplex', 'contemporary', 'minimalist']),
    constructionType: String (enum: [' RCC', 'Steel', 'Wood', 'Mixed']),
    estimatedCost: Number,
    estimatedDuration: Number    // in days
  },
  // Location
  location: {
    city: String,
    state: String,
    country: String
  },
  // Files
  files: {
    images: [{
      url: String,
      thumbnailUrl: String,
      alt: String,
      isPrimary: Boolean
    }],
    floorPlans: [{
      url: String,
      name: String,
      floor: Number
    }],
    cadFiles: [{
      url: String,
      name: String,
      format: String
    }],
    model3d: {
      url: String,
      thumbnailUrl: String,
      format: String
    },
    documents: [{
      url: String,
      name: String,
      type: String
    }]
  },
  // Status
  status: String (enum: ['draft', 'pending', 'approved', 'rejected']),
  rejectionReason: String,
  // Metrics
  metrics: {
    views: Number,
    likes: Number,
    saves: Number,
    bookings: Number
  },
  // SEO
  tags: [String],
  metaTitle: String,
  metaDescription: String,
  // Timestamps
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `engineerId`
- `category`
- `status`
- `specifications.style`
- `specifications.estimatedCost`
- `specifications.totalArea`
- `location.city`
- `createdAt`
- `slug` (unique)
- Compound indexes for filtering

#### 3.2.3 Booking Schema (`bookings`)

```javascript
{
  _id: ObjectId,
  bookingId: String (unique, readable format e.g., "BMH-2024-001234"),
  userId: ObjectId (ref: 'users'),
  engineerId: ObjectId (ref: 'users'),
  designId: ObjectId (ref: 'designs'),
  // Booking Details
  type: String (enum: ['consultation', 'design', 'construction', 'renovation']),
  status: String (enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected']),
  // Schedule
  scheduledDate: Date,
  scheduledTime: String,
  duration: Number (in minutes),
  // Meeting
  meetingType: String (enum: ['video', 'in-person', 'phone']),
  meetingLink: String,  // For video calls
  location: {
    address: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // Project Details
  projectDetails: {
    landSize: Number,
    budget: Number,
    requirements: String,
    timeline: String
  },
  // Pricing
  pricing: {
    consultationFee: Number,
    designFee: Number,
    totalAmount: Number,
    currency: String
  },
  // Timeline
  timeline: {
    requestedAt: Date,
    confirmedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: String
  },
  // Communication
  chatRoomId: ObjectId (ref: 'chats'),
  notes: String,
  // Admin
  assignedAdmin: ObjectId (ref: 'users'),
  internalNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `bookingId` (unique)
- `userId`
- `engineerId`
- `designId`
- `status`
- `scheduledDate`
- `createdAt`
- Compound indexes for booking queries

#### 3.2.4 Review Schema (`reviews`)

```javascript
{
  _id: ObjectId,
  bookingId: ObjectId (ref: 'bookings'),
  userId: ObjectId (ref: 'users'),
  engineerId: ObjectId (ref: 'users'),
  designId: ObjectId (ref: 'designs'),
  rating: Number (1-5),
  title: String,
  comment: String,
  // Breakdown
  ratings: {
    quality: Number,
    communication: Number,
    professionalism: Number,
    value: Number,
    timeliness: Number
  },
  // Media
  images: [String],
  // Response
  engineerResponse: {
    response: String,
    respondedAt: Date
  },
  isVerified: Boolean,  // Verified booking
  isApproved: Boolean,
  helpfulCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `bookingId` (unique per booking)
- `engineerId`
- `userId`
- `rating`

#### 3.2.5 Category Schema (`categories`)

```javascript
{
  _id: ObjectId,
  name: String,
  slug: String (unique),
  description: String,
  icon: String,
  image: String,
  parentId: ObjectId (ref: 'categories'),  // For subcategories
  properties: [{
    name: String,
    type: String,
    options: [String],  // For enum type
    required: Boolean
  }],
  isActive: Boolean,
  order: Number,
  designCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3.2.6 Chat Schema (`chats`)

```javascript
{
  _id: ObjectId,
  type: String (enum: ['direct', 'group', 'booking']),
  participants: [ObjectId (ref: 'users')],
  // For booking chats
  bookingId: ObjectId (ref: 'bookings'),
  // Metadata
  lastMessage: {
    messageId: ObjectId,
    text: String,
    senderId: ObjectId,
    timestamp: Date
  },
  unreadCounts: [{
    userId: ObjectId,
    count: Number
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3.2.7 Message Schema (`messages`)

```javascript
{
  _id: ObjectId,
  chatId: ObjectId (ref: 'chats'),
  senderId: ObjectId (ref: 'users'),
  type: String (enum: ['text', 'image', 'file', 'system']),
  content: {
    text: String,
    imageUrl: String,
    fileUrl: String,
    fileName: String
  },
  // Reactions
  reactions: [{
    userId: ObjectId,
    emoji: String
  }],
  // Read status
  readBy: [ObjectId],
  // For system messages
  isSystemMessage: Boolean,
  createdAt: Date
}
```

**Indexes:**
- `chatId`
- `senderId`
- `createdAt`

#### 3.2.8 Notification Schema (`notifications`)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'users'),
  type: String (enum: ['booking', 'message', 'review', 'system', 'design', 'promotion']),
  title: String,
  message: String,
  data: {
    bookingId: ObjectId,
    designId: ObjectId,
    chatId: ObjectId,
    // Additional type-specific data
  },
  link: String,
  // Delivery status
  is  readAt: Date,
  //Read: Boolean,
 Channels
  channels: {
    inApp: Boolean,
    email: Boolean,
    push: Boolean,
    sms: Boolean
  },
  // Email/push status
  emailStatus: String (enum: ['pending', 'sent', 'failed']),
  pushStatus: String,
  createdAt: Date
}
```

**Indexes:**
- `userId`
- `type`
- `isRead`
- `createdAt`

#### 3.2.9 Favorite Schema (`favorites`)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'users'),
  designId: ObjectId (ref: 'designs'),
  createdAt: Date
}
// Compound unique index on (userId, designId)
```

#### 3.2.10 User Activity Schema (`analytics`)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'users'),
  sessionId: String,
  eventType: String (enum: ['view', 'search', 'filter', 'like', 'save', 'share', 'booking']),
  designId: ObjectId,
  searchQuery: String,
  filters: Object,
  referrer: String,
  userAgent: String,
  ip: String,
  location: {
    country: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  metadata: Object,
  timestamp: Date
}
// Indexed on (userId, timestamp) and (eventType, timestamp)
```

---

## 4. API Structure

### 4.1 API Versioning

```
Base URL: /api/v1

All API endpoints follow RESTful conventions:
- GET    /resources          → List resources
- GET    /resources/:id       → Get single resource
- POST   /resources          → Create resource
- PUT    /resources/:id      → Update resource (full)
- PATCH  /resources/:id      → Update resource (partial)
- DELETE /resources/:id      → Delete resource
```

### 4.2 API Endpoints

#### 4.2.1 Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| POST | `/auth/logout` | Logout user | Auth |
| POST | `/auth/refresh-token` | Refresh access token | Public |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/reset-password` | Reset password | Public |
| POST | `/auth/verify-email` | Verify email | Public |
| POST | `/auth/resend-verification` | Resend verification email | Auth |
| GET | `/auth/me` | Get current user | Auth |
| PUT | `/auth/change-password` | Change password | Auth |

#### 4.2.2 User Endpoints (`/api/v1/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users/profile` | Get own profile | User |
| PUT | `/users/profile` | Update own profile | User |
| PUT | `/users/avatar` | Update avatar | User |
| GET | `/users/:id` | Get user by ID | Public |
| GET | `/users/:id/bookings` | Get user's bookings | User |
| GET | `/users/:id/favorites` | Get favorite designs | User |
| POST | `/users/:id/favorites/:designId` | Add to favorites | User |
| DELETE | `/users/:id/favorites/:designId` | Remove from favorites | User |
| PUT | `/users/preferences` | Update preferences | User |
| GET | `/users/preferences` | Get preferences | User |

#### 4.2.3 Engineer Endpoints (`/api/v1/engineers`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/engineers` | List engineers | Public |
| GET | `/engineers/featured` | Get featured engineers | Public |
| GET | `/engineers/:id` | Get engineer profile | Public |
| POST | `/engineers/register` | Apply as engineer | User |
| PUT | `/engineers/profile` | Update engineer profile | Engineer |
| PUT | `/engineers/availability` | Update availability | Engineer |
| PUT | `/engineers/portfolio` | Update portfolio | Engineer |
| GET | `/engineers/:id/designs` | Get engineer's designs | Public |
| GET | `/engineers/:id/reviews` | Get engineer's reviews | Public |
| GET | `/engineers/:id/availability` | Check availability | Public |
| POST | `/engineers/verify` | Submit verification docs | Engineer |

#### 4.2.4 Design Endpoints (`/api/v1/designs`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/designs` | List designs | Public |
| GET | `/designs/featured` | Get featured designs | Public |
| GET | `/designs/trending` | Get trending designs | Public |
| GET | `/designs/recommended` | Get recommended designs | User |
| GET | `/designs/search` | Search designs | Public |
| GET | `/designs/:id` | Get design details | Public |
| POST | `/designs` | Create design | Engineer |
| PUT | `/designs/:id` | Update design | Engineer |
| DELETE | `/designs/:id` | Delete design | Engineer |
| POST | `/designs/:id/like` | Like design | User |
| DELETE | `/designs/:id/like` | Unlike design | User |
| GET | `/designs/:id/related` | Get related designs | Public |
| POST | `/designs/:id/view` | Record view | Public |
| POST | `/designs/:id/share` | Record share | Public |
| GET | `/designs/categories` | Get categories | Public |
| GET | `/designs/filters/options` | Get filter options | Public |

#### 4.2.5 Booking Endpoints (`/api/v1/bookings`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/bookings` | List bookings | User/Engineer |
| GET | `/bookings/:id` | Get booking details | User/Engineer |
| POST | `/bookings` | Create booking request | User |
| PUT | `/bookings/:id` | Update booking | User/Engineer |
| PUT | `/bookings/:id/status` | Update booking status | Engineer |
| POST | `/bookings/:id/confirm` | Confirm booking | Engineer |
| POST | `/bookings/:id/cancel` | Cancel booking | User/Engineer |
| POST | `/bookings/:id/reschedule` | Reschedule booking | User |
| GET | `/bookings/:id/timeline` | Get booking timeline | User/Engineer |
| POST | `/bookings/:id/feedback` | Submit feedback | User |
| GET | `/engineers/:id/available-slots` | Get available slots | Public |

#### 4.2.6 Review Endpoints (`/api/v1/reviews`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/reviews` | List reviews | Public |
| GET | `/reviews/:id` | Get review | Public |
| POST | `/reviews` | Create review | User |
| PUT | `/reviews/:id` | Update review | User |
| DELETE | `/reviews/:id` | Delete review | User/Admin |
| POST | `/reviews/:id/response` | Engineer response | Engineer |
| POST | `/reviews/:id/helpful` | Mark as helpful | User |
| GET | `/engineers/:id/reviews` | Get engineer reviews | Public |
| GET | `/designs/:id/reviews` | Get design reviews | Public |

#### 4.2.7 Chat Endpoints (`/api/v1/chats`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/chats` | List chat conversations | User/Engineer |
| GET | `/chats/:id` | Get chat messages | User/Engineer |
| POST | `/chats` | Start new chat | User/Engineer |
| POST | `/chats/:id/messages` | Send message | User/Engineer |
| PUT | `/chats/:id/read` | Mark as read | User/Engineer |
| DELETE | `/chats/:id` | Delete/archive chat | User/Engineer |

#### 4.2.8 Notification Endpoints (`/api/v1/notifications`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/notifications` | List notifications | User |
| GET | `/notifications/unread` | Get unread count | User |
| PUT | `/notifications/:id/read` | Mark as read | User |
| PUT | `/notifications/read-all` | Mark all as read | User |
| DELETE | `/notifications/:id` | Delete notification | User |
| PUT | `/notifications/preferences` | Update preferences | User |
| DELETE | `/notifications` | Clear all notifications | User |

#### 4.2.9 Upload Endpoints (`/api/v1/uploads`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/uploads/image` | Upload image | Auth |
| POST | `/uploads/images` | Upload multiple images | Auth |
| POST | `/uploads/file` | Upload generic file | Auth |
| DELETE | `/uploads/:id` | Delete uploaded file | Auth |

#### 4.2.10 Admin Endpoints (`/api/v1/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/admin/dashboard` | Dashboard stats | Admin |
| GET | `/admin/users` | Manage users | Admin |
| PUT | `/admin/users/:id` | Update user | Admin |
| DELETE | `/admin/users/:id` | Delete user | Admin |
| GET | `/admin/engineers` | Manage engineers | Admin |
| PUT | `/admin/engineers/:id/verify` | Verify engineer | Admin |
| GET | `/admin/designs` | Manage designs | Admin |
| PUT | `/admin/designs/:id/approve` | Approve design | Admin |
| PUT | `/admin/designs/:id/reject` | Reject design | Admin |
| GET | `/admin/bookings` | Manage bookings | Admin |
| GET | `/admin/reviews` | Manage reviews | Admin |
| GET | `/admin/reports` | View reports | Admin |
| GET | `/admin/analytics` | View analytics | Admin |
| GET | `/admin/settings` | System settings | Admin |
| PUT | `/admin/settings` | Update settings | Admin |

### 4.3 Request/Response Formats

#### 4.3.1 Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Resource data
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### 4.3.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

#### 4.3.3 Authentication Headers

```
Authorization: Bearer <access_token>
X-Refresh-Token: <refresh_token>
X-Timezone: Asia/Kolkata
Accept-Language: en
```

---

## 5. Folder Structure

### 5.1 Project Root Structure

```
buildmyhome/
├── backend/                    # Backend API
├── frontend/                   # React Frontend (future)
├── mobile/                     # React Native App (future)
├── docs/                       # Documentation
├── infrastructure/             # Docker, Kubernetes configs
└── README.md
```

### 5.2 Backend Folder Structure

```
backend/
├── src/
│   ├── app.js                  # Express app entry
│   ├── server.js               # Server startup
│   ├── config/
│   │   ├── index.js            # Main config
│   │   ├── database.js         # MongoDB config
│   │   ├── redis.js            # Redis config
│   │   ├── aws.js              # S3 config
│   │   └── constants.js        # App constants
│   │
│   ├── modules/                # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.model.js
│   │   │   ├── auth.route.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.validator.js
│   │   │
│   │   ├── user/
│   │   │   ├── user.controller.js
│   │   │   ├── user.model.js
│   │   │   ├── user.route.js
│   │   │   ├── user.service.js
│   │   │   └── user.validator.js
│   │   │
│   │   ├── engineer/
│   │   │   ├── engineer.controller.js
│   │   │   ├── engineer.model.js
│   │   │   ├── engineer.route.js
│   │   │   ├── engineer.service.js
│   │   │   └── engineer.validator.js
│   │   │
│   │   ├── design/
│   │   │   ├── design.controller.js
│   │   │   ├── design.model.js
│   │   │   ├── design.route.js
│   │   │   ├── design.service.js
│   │   │   └── design.validator.js
│   │   │
│   │   ├── booking/
│   │   │   ├── booking.controller.js
│   │   │   ├── booking.model.js
│   │   │   ├── booking.route.js
│   │   │   ├── booking.service.js
│   │   │   └── booking.validator.js
│   │   │
│   │   ├── review/
│   │   │   ├── review.controller.js
│   │   │   ├── review.model.js
│   │   │   ├── review.route.js
│   │   │   ├── review.service.js
│   │   │   └── review.validator.js
│   │   │
│   │   ├── chat/
│   │   │   ├── chat.controller.js
│   │   │   ├── chat.model.js
│   │   │   ├── chat.route.js
│   │   │   ├── chat.service.js
│   │   │   └── chat.validator.js
│   │   │
│   │   ├── notification/
│   │   │   ├── notification.controller.js
│   │   │   ├── notification.model.js
│   │   │   ├── notification.route.js
│   │   │   ├── notification.service.js
│   │   │   └── notification.validator.js
│   │   │
│   │   ├── upload/
│   │   │   ├── upload.controller.js
│   │   │   ├── upload.route.js
│   │   │   ├── upload.service.js
│   │   │   └── upload.validator.js
│   │   │
│   │   ├── category/
│   │   │   ├── category.controller.js
│   │   │   ├── category.model.js
│   │   │   ├── category.route.js
│   │   │   └── category.service.js
│   │   │
│   │   ├── recommendation/
│   │   │   ├── recommendation.controller.js
│   │   │   ├── recommendation.service.js
│   │   │   ├── recommendation.engine.js
│   │   │   └── recommendation.route.js
│   │   │
│   │   └── admin/
│   │       ├── admin.controller.js
│   │       ├── admin.route.js
│   │       ├── admin.service.js
│   │       └── admin.validator.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── error.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   ├── logging.middleware.js
│   │   ├── upload.middleware.js
│   │   └── socket.middleware.js
│   │
│   ├── services/               # Shared services
│   │   ├── email.service.js
│   │   ├── push.service.js
│   │   ├── socket.service.js
│   │   ├── cache.service.js
│   │   ├── s3.service.js
│   │   └── analytics.service.js
│   │
│   ├── utils/                  # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── slugify.js
│   │   ├── generateId.js
│   │   ├── dateUtils.js
│   │   └── validationUtils.js
│   │
│   ├── constants/
│   │   ├── enums.js
│   │   ├── roles.js
│   │   ├── statuses.js
│   │   └── messages.js
│   │
│   └── sockets/                # Socket.io handlers
│       ├── index.js
│       ├── chat.handler.js
│       └── notification.handler.js
│
├── tests/                      # Test files
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── scripts/                    # Utility scripts
│   ├── seed.js
│   ├── migrate.js
│   └── deploy.js
│
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── docker-compose.yml
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── package.json
└── README.md
```

### 5.3 Module Structure Pattern

Each module follows this pattern:

```
module-name/
├── module.controller.js    # Request handlers
├── module.model.js         # Mongoose schema
├── module.route.js         # Route definitions
├── module.service.js       # Business logic
├── module.validator.js     # Input validation
└── module.constants.js    # Module-specific constants
```

### 5.4 Key Files Detail

#### 5.4.1 Main Server Entry (`src/server.js`)

```javascript
// Server initialization and middleware setup
// Database connection
// Socket.io initialization
// Error handlers
// Graceful shutdown
```

#### 5.4.2 App Configuration (`src/config/index.js`)

```javascript
// Environment variables
// Database URLs
// JWT secrets
// AWS credentials
// API keys
// Feature flags
```

#### 5.4.3 Auth Middleware (`src/middleware/auth.middleware.js`)

```javascript
// JWT verification
// Token refresh
// User loading
// Role verification
```

#### 5.4.4 Recommendation Engine (`src/modules/recommendation/recommendation.engine.js`)

```javascript
// Content-based scoring
// User behavior analysis
// Similarity calculation
// Trending algorithms
```

---

## 6. Security Considerations

### 6.1 Authentication & Authorization
- JWT with short-lived access tokens (15 min) + long-lived refresh tokens (7 days)
- Password hashing with bcrypt (12 rounds)
- Rate limiting on auth endpoints
- Account lockout after 5 failed attempts
- Email verification required for sensitive actions

### 6.2 API Security
- HTTPS only
- CORS configuration
- Request size limits
- Input validation on all endpoints
- SQL injection prevention (MongoDB operator filtering)
- XSS protection headers
- CSRF tokens for state-changing operations

### 6.3 Data Security
- Encryption at rest for sensitive data
- Secure file upload with type validation
- Virus scanning for uploaded files
- PII data handling compliance
- Regular security audits

---

## 7. Performance Optimizations

### 7.1 Database
- Proper indexing strategy
- Query optimization
- Connection pooling
- Read replicas for heavy read operations
- Caching frequently accessed data

### 7.2 API
- Response compression (gzip)
- Pagination for list endpoints
- Field filtering
- ETag caching
- CDN for static assets

### 7.3 File Handling
- Lazy loading for large files
- Image optimization
- Thumbnail generation
- Async file processing with queues

---

## 8. Deployment Architecture

### 8.1 Development
```
Local Development:
├── MongoDB (local)
├── Redis (local)
├── Node.js (nodemon)
└── React Frontend (create-react-app)
```

### 8.2 Production (Initial)
```
DigitalOcean/AWS:
├── Load Balancer (Nginx)
├── Node.js Cluster (PM2)
├── MongoDB Atlas
├── Redis (managed)
├── S3/Spaces for files
└── Socket.io server
```

### 8.3 Future Scaling
```
Microservices Architecture:
├── API Gateway (Kong)
├── Auth Service
├── User Service
├── Design Service
├── Booking Service
├── Notification Service
├── Kubernetes Cluster
└── Message Queue (RabbitMQ)
```

---

## 9. Development Workflow

### 9.1 Setup
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### 9.2 API Documentation
- Swagger/OpenAPI documentation at `/api-docs`
- Postman collection available in `/docs/postman`

---

## 10. Future Enhancements

1. **Payment Integration** - Stripe/Razorpay for booking payments
2. **Video Consultation** - WebRTC for video calls
3. **3D Viewer** - Interactive 3D model viewing
4. **Machine Learning** - Advanced ML-based recommendations
5. **Mobile Apps** - iOS and Android apps
6. **Multi-language** - Internationalization support
7. **Real-time Collaboration** - Design collaboration tools
8. **E-commerce** - Construction materials marketplace

---

*Document Version: 1.0*  
*Last Updated: 2024*  
*Architecture: MERN Stack with Scalability Focus*

