import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your actual web app's Firebase configuration keys
const firebaseConfig = {
  apiKey: "AIzaSyC0oCQx9XW6-Ccdp1TwITuPCkZ8XQgzmqs",
  authDomain: "point-zero-ccc16.firebaseapp.com",
  projectId: "point-zero-ccc16",
  storageBucket: "point-zero-ccc16.firebasestorage.app",
  messagingSenderId: "371376718175",
  appId: "1:371376718175:web:2e767517cf2fc4f12976ea",
  measurementId: "G-HQQRQ74Q57"
};

// Prevent Next.js hot-reload replication crashes by checking existing apps
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Conditionally initialize Google Analytics only inside the client-side browser environment
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) getAnalytics(app);
  });
}

// Export the authenticated and database services for signup/login logic
export const auth = getAuth(app);
export const db = getFirestore(app);