
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: any = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ebooklabs.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ebooklabs",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ebooklabs.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID
};

// Production Hardening: Fallback environment variable check
const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
requiredKeys.forEach(key => {
    if (!firebaseConfig[key]) {
        console.error(`CRITICAL: Missing Firebase configuration key: ${key}. Production environment may be unstable.`);
    }
});

// Initialize Firebase
let app;
let auth: any;
let db: any;
let analytics: any;
const googleProvider = new GoogleAuthProvider();

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    if (firebaseConfig.measurementId) {
        analytics = getAnalytics(app);
    }
} catch (error) {
    console.error("Firebase Initialization Failed:", error);
}

export { auth, googleProvider, signInWithPopup, signOut, db, analytics };

