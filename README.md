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
