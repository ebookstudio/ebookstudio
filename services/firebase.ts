
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: any = {
    apiKey: "AIzaSyDn57R2oX8KINPOnwI2TTG2wpMGxdurY4o",
    authDomain: "ebooklabs.firebaseapp.com",
    projectId: "ebooklabs",
    storageBucket: "ebooklabs.firebasestorage.app",
    messagingSenderId: "872644278150",
    appId: "1:872644278150:web:cdbc149ebac592a05fde07",
    measurementId: "G-66VFZ22PKV"
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

