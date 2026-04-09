# Velewera Clothing Store

A complete e-commerce solution with Next.js frontend, admin panel, and Express.js backend.

## Project Structure

```
Clothing_App/
├── frontend/          # Next.js client application
├── admin-panel/       # Next.js admin panel
└── backend/           # Express.js API server
```

## Features

### Frontend (Client)
- Modern responsive design with Tailwind CSS
- Product browsing with gender and category filtering
- Dynamic product loading from backend API (Firestore-backed)
- Mobile-friendly navigation

### Admin Panel
- Complete product management (CRUD operations)
- Image upload and management
- Stock and size management
- Order tracking and management
- Real-time dashboard with statistics

### Backend API
- RESTful API with Express.js
- Firebase Admin SDK with Cloud Firestore
- File upload handling with Multer
- API key authentication for admin operations
- Order management system

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:4000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

### 3. Admin Panel Setup

```bash
cd admin-panel
npm install
npm run dev
```

The admin panel will run on `http://localhost:3001`

## Environment Variables & Secrets

All secrets are stored locally in environment files that are ignored by Git, so they are never pushed to GitHub.

- Backend secrets: backend/.env
- Frontend secrets: frontend/.env.local
- Admin Panel config: admin-panel/.env.local

### Backend (.env or .env.local)
```
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your private key...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com
API_KEY=admin123
PORT=4000
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-web-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_KEY=admin123
```

### Admin Panel (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_KEY=admin123
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get all orders (admin)
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status (admin)

## Usage

1. Start the backend server
2. Start the frontend and admin panel
3. Use the admin panel to add products with images, descriptions, prices, and stock
4. View products on the frontend client
5. Manage orders through the admin panel

## Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Admin Panel**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, Firebase Admin SDK (Cloud Firestore), Multer
- **Authentication**: API Key based

## Where Your Keys Are Stored (Safe but Accessible)
- Frontend Firebase Web keys are stored in frontend/.env.local. These are required by the browser app and use NEXT_PUBLIC_ variables. They are ignored by Git and will not be pushed.
- Backend admin credentials are stored in backend/.env (FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, etc.). This file is also Git-ignored and not pushed.
- The Firebase service account JSON file (if present) and uploads/ are Git-ignored by patterns in .gitignore.

To access or change your keys:
- Open frontend/.env.local for the web Firebase config and API settings.
- Open backend/.env for the Firebase Admin credentials and server settings.
- Both files are local-only; keep a personal backup if you work on multiple machines.


##Overview
- Full e‑commerce suite named “Velewera Clothing Store” with three apps:
- Frontend shopper site (Next.js) for browsing, cart, checkout, orders, and reviews.
- Admin panel (Next.js) used to manage products, images, stock, and orders.
- Backend API (Express) using Firebase Admin SDK with Cloud Firestore for persistent data and Multer for image uploads.
Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, axios, Firebase Web SDK.
- Admin Panel: Next.js 15, React 19, TypeScript, react‑hook‑form, yup, axios.
- Backend: Node.js, Express, Firebase Admin SDK (Cloud Firestore), Multer, dotenv, cors.
- Auth model: API‑Key header for admin endpoints; client‑side Google provider support via Firebase (configurable).
Project Layout

- Root: README.md , .gitignore , dev utilities like test-api.js and test-orders.js .
- Frontend: frontend (Next.js app).
- Admin Panel: admin-panel (Next.js app).
- Backend: backend (Express API + Firestore).
Frontend

- Core files
  - App shell/layout: layout.tsx loads Firebase CDN compat scripts before interactivity and wraps UI with an AuthProvider.
  - Firebase config/SDK: firebase.ts reads NEXT_PUBLIC_ env vars, exposes waitForFirebase and GoogleAuthProvider.
  - API client: api.ts uses NEXT_PUBLIC_API_URL and NEXT_PUBLIC_API_KEY to call backend endpoints (products, orders, payment, users, reviews).
  - Auth context: AuthContext.tsx handles client auth state, integrates with Firebase Auth.
  - UI: Navbar.tsx , Footer.tsx .
- Pages and flows
  - Catalog listing: products/page.tsx fetches products via API with optional gender/category filters.
  - Product detail: products/[productName]/page.tsx looks up product by human‑readable slug (name with dashes), loads reviews, supports color/size selection and client cart/wishlist operations.
  - Cart/Checkout: cart/page.tsx , checkout/page.tsx gather order details and trigger payment/create‑order.
  - Orders: orders/page.tsx and orders/success/page.tsx render order lists and success confirmation.
  - Payment placeholders: payment/card/page.tsx , payment/upi/page.tsx are stubbed for card/UPI flows.
- Notable behavior
  - Local image assets in frontend/public .
  - Wishlist and cart data persisted to localStorage on the client.
  - Styling via Tailwind CSS (globals in globals.css ).
Admin Panel

- API client: admin-panel/src/lib/api.ts mirrors the frontend API client pattern; takes NEXT_PUBLIC_API_URL and NEXT_PUBLIC_API_KEY; sends x‑api‑key on admin requests.
- Product management
  - List: products/page.tsx
  - Create: products/new/page.tsx with multipart image upload and form validation (react‑hook‑form + yup).
  - Edit: products/[id]/edit/page.tsx supports updating fields, merging new and existing images, and size/color management.
- Orders dashboard
  - Orders list and status updates in orders/page.tsx using /orders endpoints.
- General dashboard
  - page.tsx home with stats via /orders/stats/overview.
- Tech details
  - React + Next 15, TypeScript, validation with yup, form handling with react‑hook‑form.
  - Tailwind config present; images referenced directly; Next.js warnings recommend next/image for optimization.
Backend API

- Initialization and middleware
  - Entry: index.js loads dotenv, initializes Firebase Admin, configures CORS, JSON parsing, serves static uploads directory, and wires routes.
  - Firebase Admin: firebase.js builds service account from env and initializes Firestore.
  - Config: config.js reads env with fallbacks.
- Data models (Firestore)
  - Product: models/Product.js
    - Fields: name, description, leathercare, images[], gender, category, sizes[{ size, stock }], colors[], price, createdAt, updatedAt.
    - Methods for create, find (with filters), findById, update, delete.
  - Order: models/Order.js
    - Fields: user (id/name/email/phone/address), contact, address, products[], total, paymentMethod, status, createdAt, updatedAt, expectedDeliveryDate (+15 days default).
    - Queries include find with optional status, findByUserId (post‑query sort to avoid composite index), update, aggregation for revenue.
    - Converts Firestore timestamps to ISO strings for API responses.
  - Review: models/Review.js
    - Fields: productId, orderId, user, rating, comment, createdAt.
    - Query by product with client‑side sorting to avoid Firestore composite indexes.
- Routes
  - Products: routes/products.js
    - GET /api/products (public) with gender/category filters; GET /api/products/:id (public).
    - POST /api/products (admin, x‑api‑key) with multipart image uploads to /uploads; PUT for updates; DELETE for removal and file cleanup.
  - Orders: routes/orders.js
    - GET /api/orders (admin, x‑api‑key) with status filters.
    - GET /api/orders/:id (admin, x‑api‑key).
    - POST /api/orders (public) to create order documents.
    - PUT /api/orders/:id (admin, x‑api‑key) to update status.
    - GET /api/orders/stats/overview (admin, x‑api‑key) for total/pending/delivered counts and revenue.
    - GET /api/orders/user/:uid (public) to fetch a user’s orders.
  - Payment: routes/payment.js
    - POST /api/payment/create-order: constructs an order record with shipping/contact/user info, returns a payment URL based on paymentMethod (card/upi/cod placeholders).
    - POST /api/payment/verify: marks order processing (stubbed verification step).
  - Users: routes/users.js
    - POST /api/users/profile: upserts a user profile in Firestore.
  - Reviews: routes/reviews.js
    - GET /api/reviews/product/:productId (public).
    - POST /api/reviews (public), accepts optional orderId and user info.
- File uploads
  - Images saved locally under backend/uploads and served statically at /uploads; product image URLs are absolute http://localhost:4000/uploads/ <filename>.</filename>
- Utilities and diagnostics
  - debug-firebase.js lists products from Firestore for connectivity debugging.
  - test-api.js quick product API checks.
  - test-orders.js creates and queries orders against the API.
Environment & Secrets

- Frontend env: frontend/.env.local holds NEXT_PUBLIC_FIREBASE_* and API config; used by the browser; ignored by Git.
- Backend env: backend/.env holds FIREBASE_* admin credentials, API_KEY, PORT, JWT_SECRET, FRONTEND_URL; ignored by Git.
- Git ignore rules: .gitignore excludes .env files project‑wide and Firebase admin JSON.
Run & Ports

- Backend: cd backend; npm install; npm start → http://localhost:4000
- Frontend: cd frontend; npm install; npm run dev → http://localhost:3000
- Admin Panel: cd admin-panel; npm install; npm run dev → http://localhost:3001
Data Flow

- Frontend and Admin call the backend via axios using base URL env. Admin requests include x‑api‑key; public paths are open.
- Backend persists products, orders, reviews, and users in Firestore; product images are stored as local files and referenced by absolute URLs.
