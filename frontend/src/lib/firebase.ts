import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration sourced from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
} as const;

// Global Firebase variables
declare global {
  interface Window {
    firebase: any;
    google: any;
  }
}

let app: any = null;
let auth: any = null;

// Initialize Firebase when available
if (typeof window !== 'undefined' && window.firebase) {
  try {
    app = window.firebase.initializeApp(firebaseConfig);
    auth = window.firebase.auth();
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export { auth, firebaseConfig };

// Helper function to ensure Firebase is loaded
export const waitForFirebase = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.firebase) {
      if (!app) {
        app = window.firebase.initializeApp(firebaseConfig);
        auth = window.firebase.auth();
      }
      resolve(auth);
    } else {
      // Wait for Firebase to load
      const checkFirebase = () => {
        if (window.firebase) {
          app = window.firebase.initializeApp(firebaseConfig);
          auth = window.firebase.auth();
          resolve(auth);
        } else {
          setTimeout(checkFirebase, 100);
        }
      };
      checkFirebase();
    }
  });
};
export const googleProvider = new GoogleAuthProvider();
