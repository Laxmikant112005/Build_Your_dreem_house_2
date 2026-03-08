# BuildMyHome Backend API

A comprehensive RESTful API for the BuildMyHome platform - a house design booking platform connecting users with architects and engineers.

## 🚀 Features

- **Authentication**: JWT-based auth with refresh tokens
- **User Management**: Profile management, preferences, engineer applications
- **Engineer Profiles**: Portfolio management, availability, ratings
- **Design Management**: House designs with filtering, search, categories
- **Booking System**: Consultation scheduling with availability checking
- **Reviews & Ratings**: Engineer reviews with responses
- **Chat System**: Real-time messaging with Socket.io
- **Notifications**: Real-time notifications
- **Recommendations**: Personalized design recommendations
- **Admin Dashboard**: User management, content moderation

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # MongoDB connection
│   │   ├── redis.js      # Redis connection
│   │   ├── multer.js     # File upload config
│   │   └── index.js      # Main config
│   ├── constants/        # Enums and constants
│   ├── middleware/       # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── validation.middleware.js
│   ├── modules/          # Feature modules
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── booking/
│   │   ├── category/
│   │   ├── chat/
│   │   ├── design/
│   │   ├── engineer/
│   │   ├── favorite/
│   │   ├── notification/
│   │   ├── recommendation/
│   │   ├── review/
│   │   ├── upload/
│   │   └── user/
│   ├── routes/           # API routes
│   ├── sockets/          # Socket.io handlers
│   ├── utils/            # Utility functions
│   ├── app.js            # Express app
│   └── server.js         # Server entry point
├── package.json
└── .env.example
```

## 🛠️ Setup

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- Redis >= 7.0 (optional)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure .env file with your values
# Required variables:
# - MONGODB_URI
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - CLIENT_URL

# Start development server
npm run dev
```

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout user |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |
| PUT | `/api/v1/auth/change-password` | Change password |
| GET | `/api/v1/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/:id` | Get user by ID |
| GET | `/api/v1/users/profile/me` | Get own profile |
| PUT | `/api/v1/users/profile/me` | Update profile |
| GET | `/api/v1/users/preferences/me` | Get preferences |
| PUT | `/api/v1/users/preferences/me` | Update preferences |
| GET | `/api/v1/users/bookings/me` | Get user bookings |
| GET | `/api/v1/users/favorites/me` | Get favorite designs |
| POST | `/api/v1/users/apply-engineer` | Apply as engineer |

### Engineers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/engineers` | List engineers |
| GET | `/api/v1/engineers/featured` | Featured engineers |
| GET | `/api/v1/engineers/search` | Search engineers |
| GET | `/api/v1/engineers/:id` | Engineer profile |
| GET | `/api/v1/engineers/:id/designs` | Engineer's designs |
| GET | `/api/v1/engineers/:id/reviews` | Engineer's reviews |
| GET | `/api/v1/engineers/:id/stats` | Engineer statistics |
| PUT | `/api/v1/engineers/profile` | Update profile |
| PUT | `/api/v1/engineers/availability` | Update availability |
| POST | `/api/v1/engineers/portfolio` | Add portfolio item |
| DELETE | `/api/v1/engineers/portfolio/:portfolioId` | Remove portfolio |

### Designs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/designs` | List designs |
| GET | `/api/v1/designs/featured` | Featured designs |
| GET | `/api/v1/designs/trending` | Trending designs |
| GET | `/api/v1/designs/filters/options` | Filter options |
| GET | `/api/v1/designs/:id` | Design details |
| GET | `/api/v1/designs/slug/:slug` | Design by slug |
| POST | `/api/v1/designs` | Create design |
| PUT | `/api/v1/designs/:id` | Update design |
| DELETE | `/api/v1/designs/:id` | Delete design |
| POST | `/api/v1/designs/:id/submit` | Submit for approval |
| POST | `/api/v1/designs/:id/like` | Like design |
| GET | `/api/v1/designs/:id/related` | Related designs |
| GET | `/api/v1/designs/engineer/my-designs` | My designs |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/bookings/engineer/:engineerId/availability` | Check availability |
| GET | `/api/v1/bookings/my-bookings` | User's bookings |
| POST | `/api/v1/bookings` | Create booking |
| GET | `/api/v1/bookings/:id` | Get booking |
| PUT | `/api/v1/bookings/:id/status` | Update status |
| POST | `/api/v1/bookings/:id/confirm` | Confirm booking |
| POST | `/api/v1/bookings/:id/cancel` | Cancel booking |
| GET | `/api/v1/bookings/engineer/my-bookings` | Engineer's bookings |
| GET | `/api/v1/bookings/engineer/stats` | Booking statistics |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reviews` | List reviews |
| GET | `/api/v1/reviews/engineer/:engineerId` | Engineer reviews |
| GET | `/api/v1/reviews/stats/:engineerId` | Review statistics |
| GET | `/api/v1/reviews/:id` | Get review |
| POST | `/api/v1/reviews` | Create review |
| PUT | `/api/v1/reviews/:id` | Update review |
| DELETE | `/api/v1/reviews/:id` | Delete review |
| POST | `/api/v1/reviews/:id/helpful` | Mark helpful |
| POST | `/api/v1/reviews/:id/respond` | Engineer response |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/categories/hierarchy` | Category hierarchy |
| GET | `/api/v1/categories/slug/:slug` | Category by slug |
| GET | `/api/v1/categories/:id` | Category details |
| GET | `/api/v1/categories/:id/subcategories` | Subcategories |
| GET | `/api/v1/categories/:id/designs` | Category designs |
| POST | `/api/v1/categories` | Create category |
| PUT | `/api/v1/categories/:id` | Update category |
| DELETE | `/api/v1/categories/:id` | Delete category |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/chats` | List chats |
| POST | `/api/v1/chats` | Create/get chat |
| GET | `/api/v1/chats/:id/messages` | Get messages |
| POST | `/api/v1/chats/:id/messages` | Send message |
| PUT | `/api/v1/chats/:id/read` | Mark as read |
| DELETE | `/api/v1/chats/:id` | Delete chat |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | List notifications |
| PUT | `/api/v1/notifications/:id/read` | Mark as read |
| PUT | `/api/v1/notifications/read-all` | Mark all read |
| DELETE | `/api/v1/notifications/:id` | Delete notification |
| DELETE | `/api/v1/notifications/delete-all` | Clear all |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/recommendations/home` | Home recommendations |
| GET | `/api/v1/recommendations/trending` | Trending designs |
| GET | `/api/v1/recommendations/popular` | Popular designs |
| GET | `/api/v1/recommendations/designs/:id` | Similar designs |
| GET | `/api/v1/recommendations/budget` | Budget-based |
| GET | `/api/v1/recommendations/style/:style` | Style-based |
| GET | `/api/v1/recommendations/personalized` | Personalized |
| GET | `/api/v1/recommendations/engineers` | Engineer recommendations |
| POST | `/api/v1/recommendations/interact` | Record interaction |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard` | Dashboard stats |
| GET | `/api/v1/admin/users` | List users |
| GET | `/api/v1/admin/designs` | List designs |
| PUT | `/api/v1/admin/designs/:id/approve` | Approve design |
| PUT | `/api/v1/admin/designs/:id/reject` | Reject design |
| PUT | `/api/v1/admin/engineers/:id/verify` | Verify engineer |
| GET | `/api/v1/admin/bookings` | List bookings |
| GET | `/api/v1/admin/stats` | Platform statistics |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/uploads/image` | Upload image |
| POST | `/api/v1/uploads/images` | Upload multiple |
| POST | `/api/v1/uploads/file` | Upload file |
| POST | `/api/v1/uploads/design-file` | Upload design file |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Include Token

Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Refresh

When the access token expires, use the refresh token to get a new one:

```json
POST /api/v1/auth/refresh-token
{
  "refreshToken": "<refresh_token>"
}
```

## 👥 Roles

- **user**: Regular users who can browse designs, book engineers, write reviews
- **engineer**: Verified engineers who can create designs, manage bookings
- **admin**: Administrators with full platform access

## 📝 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "pagination": { ... }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## 🔌 Socket.io Events

### Connection
```javascript
const socket = io.connect('http://localhost:5000', {
  auth: { token: '<access_token>' }
});
```

### Events
- `join-chat` - Join a chat room
- `leave-chat` - Leave a chat room
- `send-message` - Send a message
- `typing` - Typing indicator
- `mark-read` - Mark messages as read
- `new-message` - Receive new message
- `notification` - Receive notification
- `chat-update` - Chat list update

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📄 License

MIT License - BuildMyHome Team

