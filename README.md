# TopNotchProducts - MERN Stack E-Commerce Platform

A fully functional, production-ready, enterprise-grade grocery e-commerce platform built with the MERN Stack (MongoDB, Express.js, React.js, Node.js).

## 🚀 Features

- **Advanced Authentication:** JWT-based, Refresh Tokens, RBAC (Customer, Admin, SuperAdmin)
- **Product & Category Management:** Hierarchical categories, Product variants, Image galleries.
- **Search & Filtering:** Keyword search, Price filtering, Category filtering, Sorting.
- **Shopping Cart & Wishlist:** Persisted in the database.
- **Checkout & Payments:** Stripe and Razorpay integrations.
- **Order Management:** Tracking, Status updates, Invoicing.
- **Promotions:** Coupons, Offers, Flash Sales.
- **Reviews & Ratings:** With Admin moderation.
- **Admin Dashboard:** Analytics, Sales graphs, CRUD operations.
- **Responsive UI:** Premium design inspired by Blinkit/Zepto with Tailwind CSS & Framer Motion.
- **i18n Support:** Multi-language (English + Hindi).

## 📁 Folder Structure

```
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # DB & external service configs
│   │   ├── controllers/      # Route logic
│   │   ├── middlewares/      # Auth, Error handling, Multer
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routes
│   │   └── utils/            # ApiError, ApiResponse, Cloudinary
│   ├── app.js                # Express App Setup
│   ├── server.js             # Entry Point
│   └── seed.js               # Dummy data generator
│
├── frontend/                 # React.js (Vite) App
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components (Home, Cart, Admin)
│   │   ├── redux/            # Redux Toolkit store & slices
│   │   └── index.css         # Tailwind directives & Custom CSS
│   ├── vercel.json           # Vercel deployment config
│   └── tailwind.config.js    # Premium UI Theme Config
```

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, Redux Toolkit, React Router, Tailwind CSS, Axios, React-i18next.
- **Backend:** Node.js, Express.js, Mongoose.
- **Database:** MongoDB Atlas.
- **Cloud Storage:** Cloudinary.
- **Payments:** Stripe, Razorpay.

## 🚀 Deployment Instructions

### Backend (Render/Railway/Heroku)
1. Add `.env` variables from `backend/.env`.
2. Set build command: `npm install`
3. Set start command: `npm start` (Runs `node src/server.js`)

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel.
2. Select the `frontend` folder as the Root Directory.
3. Vercel will automatically detect Vite and configure the build settings.
4. Add `.env` variables if any (e.g., `VITE_API_BASE_URL`).

## 📜 API Documentation
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/products` - Get all products (with pagination & filters)
- `POST /api/v1/orders` - Place a new order
- `POST /api/v1/payments/stripe/process` - Generate Stripe Client Secret

## ⚙️ Initial Setup (Local Development)

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables:**
   Update `backend/.env` with your MongoDB URI, Cloudinary Keys, and Payment Keys.

3. **Seed Database:**
   ```bash
   node seed.js
   ```

4. **Start Backend Server:**
   ```bash
   npm run dev
   ```

5. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

6. **Start Frontend Server:**
   ```bash
   npm run dev
   ```
