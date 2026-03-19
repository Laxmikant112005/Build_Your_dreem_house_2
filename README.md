# 🏠 BuildMyHome (Planova)

> 🚀 AI-Powered House Design & Engineering Marketplace Platform

BuildMyHome (Planova) is a full-stack, production-ready web platform that helps users design their dream homes, connect with professional engineers, explore materials, and manage the entire construction process — all in one place.

---

## 🌟 Features

### 🔐 Authentication & Security

* JWT-based authentication
* OTP verification system
* Role-based access (User | Engineer | Admin)
* Secure password hashing (bcrypt)

---

### 🗺 Field Mapping System

* Interactive map (Leaflet)
* Draw land boundaries (polygon)
* Auto area calculation
* Geolocation detection (lat/lng + city metadata)

---

### 🏠 Design Management

* Browse and filter house designs:

  * BHK type
  * Style
  * Facing direction
  * Floors
  * Price & area range
* Pagination & responsive UI

---

### 🤖 AI-Powered Features

* Smart design suggestions (OpenAI + fallback logic)
* Cost estimation engine (budget breakdown)
* Material recommendations

---

### 🧊 2D/3D Visualization + Editing

* Interactive 3D viewer (React Three Fiber)
* Orbit controls (zoom, rotate, pan)
* TransformControls for editing:

  * Drag
  * Scale
  * Rotate
* 2D fallback for designs without models

---

### 👷 Engineer Marketplace

* Discover engineers using:

  * Location (Haversine distance)
  * Ratings
  * Price
  * Experience
* Portfolio management
* Engineer verification system

---

### 📅 Booking System

* Time-slot based booking
* Conflict detection (no double booking)
* MongoDB transaction handling
* Booking lifecycle management

---

### 💳 Payments Integration

* Razorpay integration
* Secure payment verification
* Booking confirmation after payment
* Webhook-ready backend

---

### 💬 Real-Time Chat

* Socket.io powered messaging
* Conversation + message models
* File sharing support (Cloudinary)
* Read receipts & real-time updates

---

### 🛒 Marketplace (E-commerce)

* Materials browsing & filtering
* Add to cart system
* Order management
* Payment integration
* Order tracking (status updates)

---

### 📊 Engineer Dashboard

* Total earnings
* Completed projects
* Average per project
* Real-time data from bookings/payments

---

### 🛡 Admin Panel

* User management (ban/unban)
* Engineer verification
* Order & payment monitoring
* Platform analytics (growth stats)
* Fraud detection (flagged users/reviews)

---

## 🧱 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* React Router
* React Three Fiber (3D)
* Socket.io Client

### Backend

* Node.js + Express
* MongoDB (Mongoose)
* JWT Authentication
* Socket.io

### Integrations

* OpenAI API (AI features)
* Razorpay (payments)
* Cloudinary (file uploads)
* Leaflet (maps)

---

## 📁 Project Structure

```
/client       → React frontend
/backend      → Node.js backend

backend/
  ├── modules/
  │   ├── auth/
  │   ├── users/
  │   ├── engineers/
  │   ├── designs/
  │   ├── booking/
  │   ├── marketplace/
  │   ├── admin/
  │   └── ai/
  ├── middleware/
  └── config/

client/
  ├── components/
  ├── pages/
  ├── services/
  └── utils/
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd buildmyhome
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

OPENAI_API_KEY=your_key

CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🧪 Testing the App

* Register → Verify OTP → Login
* Draw field on map
* Browse & filter designs
* View 3D models & edit
* Find engineers → Chat → Book
* Make payment (test mode)
* View earnings dashboard
* Explore marketplace
* Admin panel controls

---

## 🚀 Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

## 📈 Future Improvements

* Microservices architecture
* PostgreSQL for transactions
* Redis caching
* Advanced AI recommendations
* Notifications (Email/SMS)
* Invoice generation

---

## 👨‍💻 Author

**Laxmikant Sangolagi**
CSE Student | Full Stack Developer

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Final Note

This project demonstrates a **complete full-stack system** including:

* Real-time communication
* AI integration
* Payments
* 3D visualization
* Marketplace architecture

> 💡 Built as a production-ready, startup-level platform.
