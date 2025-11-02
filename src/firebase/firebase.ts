// src/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8jAL7GuO1q-agYZgXDgLAegzsuy-XJTQ",
  authDomain: "trackorbepoor.firebaseapp.com",
  projectId: "trackorbepoor",
  storageBucket: "trackorbepoor.appspot.com",
  messagingSenderId: "953481842013",
  appId: "1:953481842013:web:8f82ebbca0ce63b0952cb4",
  measurementId: "G-7PFVZGC7WB",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
