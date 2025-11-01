// src/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8jAL7GuO1q-agYZgXDgLAegzsuy-XJTQ",
  authDomain: "trackorbepoor.firebaseapp.com",
  projectId: "trackorbepoor",
  storageBucket: "trackorbepoor.firebasestorage.app",
  messagingSenderId: "953481842013",
  appId: "1:953481842013:web:8f82ebbca0ce63b0952cb4",
  measurementId: "G-7PFVZGC7WB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);
