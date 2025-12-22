// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Yahan apna Firebase Config Object paste karein
// (Project Settings > General > Your Apps > SDK Setup se milega)
const firebaseConfig = {
  apiKey: "AIzaSyD...", // Apna API Key yahan dalein
  authDomain: "hitkunj-eebc2.firebaseapp.com",
  databaseURL: "https://hitkunj-eebc2-default-rtdb.firebaseio.com/", // Aapka URL
  projectId: "hitkunj-eebc2",
  storageBucket: "hitkunj-eebc2.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// Next.js mein multiple connections rokne ke liye ye check zaroori hai
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { db };