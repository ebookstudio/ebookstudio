import Conf from 'conf';
import fetch from 'node-fetch';
import { FIREBASE_API_KEY, FIREBASE_AUTH_URL, FIREBASE_REFRESH_URL } from './config';

export interface Session {
  uid: string;
  email: string;
  name: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number; // unix ms
}

// Persistent config stored in ~/.config/elabs-cli/config.json
const store = new Conf<{ session: Session | null }>({
  projectName: 'elabs-cli',
  defaults: { session: null },
});

// ─── Token Management ─────────────────────────────────────────────────────────
export function getSession(): Session | null {
  return store.get('session');
}

export function saveSession(session: Session): void {
  store.set('session', session);
}

export function clearSession(): void {
  store.set('session', null);
}

export async function getValidToken(): Promise<string | null> {
  const session = getSession();
  if (!session) return null;

  // Refresh if expires within 5 minutes
  if (Date.now() > session.expiresAt - 5 * 60 * 1000) {
    try {
      const res = await fetch(FIREBASE_REFRESH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: session.refreshToken }),
      });
      const data = await res.json() as any;
      if (data.id_token) {
        const updated: Session = {
          ...session,
          idToken: data.id_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + parseInt(data.expires_in, 10) * 1000,
        };
        saveSession(updated);
        return updated.idToken;
      }
    } catch {
      // Token refresh failed — session expired
      clearSession();
      return null;
    }
  }
  return session.idToken;
}

// ─── Login / Logout ───────────────────────────────────────────────────────────
export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; session?: Session }> {
  try {
    const res = await fetch(FIREBASE_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const data = await res.json() as any;

    if (data.error) {
      const msg = data.error.message as string;
      if (msg.includes('EMAIL_NOT_FOUND') || msg.includes('INVALID_PASSWORD') || msg.includes('INVALID_LOGIN_CREDENTIALS')) {
        return { success: false, error: 'Invalid email or password.' };
      }
      if (msg.includes('TOO_MANY_ATTEMPTS')) {
        return { success: false, error: 'Too many failed attempts. Try again later.' };
      }
      return { success: false, error: msg };
    }

    const session: Session = {
      uid: data.localId,
      email: data.email,
      name: data.displayName || email.split('@')[0],
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + parseInt(data.expiresIn, 10) * 1000,
    };
    saveSession(session);
    return { success: true, session };
  } catch (err: any) {
    return { success: false, error: `Network error: ${err.message}` };
  }
}

export function isLoggedIn(): boolean {
  return getSession() !== null;
}
