import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6U8-1hsTMw4MU7QhR4UVN7frl5lsJrUY",
  authDomain: "try-on-daily-b8098.firebaseapp.com",
  projectId: "try-on-daily-b8098",
  storageBucket: "try-on-daily-b8098.firebasestorage.app",
  messagingSenderId: "993957047363",
  appId: "1:993957047363:web:8c60f4aa9960aeeb2bf8f6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore Database
export const db = getFirestore(app);

export default app;
