// ─── EbookStudio Constants ────────────────────────────────────────────────────
export const API_BASE = 'https://ebookstudio.vercel.app';

// Firebase project config (same as web app — public, read-only auth only)
export const FIREBASE_API_KEY = 'AIzaSyDn57R2oX8KINPOnwI2TTG2wpMGxdurY4o';
export const FIREBASE_AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
export const FIREBASE_REFRESH_URL = `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`;
export const FIREBASE_SIGNUP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;

// CLI branding
export const CLI_NAME = 'elabs';
export const CLI_VERSION = '1.0.0';
export const BRAND_COLOR = '#6366f1'; // indigo
