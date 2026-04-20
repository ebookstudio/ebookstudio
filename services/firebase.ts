
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_API_KEY || "AIzaSyCoe4zQ0HKezes6EsolNJxBQ21ndBGYc2A",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "code-co-writter.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "code-co-writter",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "code-co-writter.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "718562308268",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:718562308268:web:69a5cbfea57e5a30c82f09",
    measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || "G-3FGFTJ97FP"
};

// Initialize Firebase
let app;
let auth: any;
let db: any;
let analytics: any;
const googleProvider = new GoogleAuthProvider();

// Add custom parameters for Google Login
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    if (firebaseConfig.measurementId && typeof window !== 'undefined') {
        analytics = getAnalytics(app);
    }
} catch (error) {
    console.error("Firebase Initialization Failed:", error);
}

export { auth, googleProvider, signInWithPopup, signOut, db, analytics };
