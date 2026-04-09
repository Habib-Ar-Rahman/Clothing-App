# Velewera Clothing Store - Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Firebase Project** (for database)

## Quick Setup

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing project: `velewerashop`
3. Enable Firestore Database in production mode
4. Generate service account key (already provided in the project)

### 2. Start the Backend
```bash
cd backend
npm install
npm start
```
*Runs on http://localhost:4000*

### 3. Start the Admin Panel
```bash
cd admin-panel
npm install
npm run dev
```
*Runs on http://localhost:3001*

### 4. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*Runs on http://localhost:3000*

## Usage

1. **Admin Panel** (http://localhost:3001):
   - Add products with images, descriptions, prices
   - Manage stock and sizes
   - View and manage orders

2. **Frontend** (http://localhost:3000):
   - Browse products by gender and category
   - View product details and availability

## Troubleshooting

### Firebase Connection Error
If you see "Firebase connection error":
- Check if Firebase credentials are correctly set in .env file
- Verify Firebase project ID matches your project
- Ensure Firestore is enabled in your Firebase project

### Port Already in Use
If ports 3000, 3001, or 4000 are in use:
- Stop other applications using these ports
- Or change ports in the respective package.json files

### Image Upload Issues
- Make sure the `uploads` folder exists in the backend directory
- Check file permissions for the uploads folder
