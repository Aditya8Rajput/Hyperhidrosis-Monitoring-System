import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for HyperTrack
const firebaseConfig = {
  apiKey: "AIzaSyA57chyOrppR45HzXQGHlqjkAShiW-Fr2c",
  authDomain: "hyper-track-a9b50.firebaseapp.com",
  projectId: "hyper-track-a9b50",
  storageBucket: "hyper-track-a9b50.firebasestorage.app",
  messagingSenderId: "792773221147",
  appId: "1:792773221147:web:6bb27eefe8cd0b385c91be"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
