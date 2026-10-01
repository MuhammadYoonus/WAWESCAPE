# WAWECAPE – Sri Lankan Travel Agency

A full-stack MERN web application for a local Sri Lankan travel agency.

## Main features
- Public home page with featured tours
- Day tours and multi-day tours
- Sri Lanka round tours
- Short experiences: whale watching, Yala safari, turtle farm, snake farm, etc.
- Tour details and booking form
- User registration/login with JWT
- Customer booking history
- Admin dashboard for tours and bookings
- MongoDB database
- Express/Node.js REST API
- React frontend
- Tailwind CSS styling

## Technology mapping to the Web Development module
- HTML/CSS: React JSX and Tailwind CSS
- JavaScript framework: React.js
- Client-server architecture: React client communicates with Express API
- HTTP: REST API using GET, POST, PUT and DELETE
- Database: MongoDB
- Backend: Node.js + Express.js
- Full-stack framework/stack: MERN

## Requirements
- Node.js 20+
- MongoDB local installation OR MongoDB Atlas
- npm

## Run

### 1. Backend
```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

### 2. Frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

Seeded admin:
- Email: admin@wavecape.lk
- Password: Admin123!

Change this password before real deployment.

## Environment
Backend `.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/wavecape
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
```

## Suggested future extensions
- Online payment gateway
- Google Maps
- Email/SMS booking confirmation
- Cloud image storage
- Tour availability calendar
- Reviews and ratings
- Coupon system
- PDF invoices
