// Import the necessary Firebase functions
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

// Your Firebase app's configuration
const firebaseConfig = {
  apiKey: "AIzaSyABaqVFLo_1r93a7TJdKg5JqrIKSAxz3jQ",
  authDomain: "projectpulse-fd811.firebaseapp.com",
  projectId: "projectpulse-fd811",
  storageBucket: "projectpulse-fd811.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "443694499532",
  appId: "1:443694499532:web:709cba13884a0edc776469",
  measurementId: "G-VMW38EGXPB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics (if needed)
// const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Initialize Firebase Storage
export const storage = getStorage(app);

// Export app in case it's needed elsewhere
export default app;
