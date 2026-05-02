import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || 'mock-api-key',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || 'mock-auth-domain',
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || 'mock-project-id',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || 'mock-storage-bucket',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || 'mock-sender-id',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || 'mock-app-id',
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || undefined
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = (typeof window !== 'undefined' && firebaseConfig.measurementId) 
  ? getAnalytics(app) 
  : null;
