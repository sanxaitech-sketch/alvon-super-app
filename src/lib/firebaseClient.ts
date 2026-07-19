import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyzoWlixsRMH69tPqzk5ALjnAZEELjedM",
  authDomain: "alvon-super-app.firebaseapp.com",
  projectId: "alvon-super-app",
  storageBucket: "alvon-super-app.firebasestorage.app",
  messagingSenderId: "621345988059",
  appId: "1:621345988059:web:25cc5a98d5895076741bfe",
  measurementId: "G-C2735FN2P7"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

export { app, db, auth, storage };

