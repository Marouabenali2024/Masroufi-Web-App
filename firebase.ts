/**
 * firebase.ts — Fixed Version
 * 
 * FIXES:
 * 1. Uses environment variables instead of exposed JSON config file
 * 2. Handles missing firestoreDatabaseId gracefully
 * 3. Better error reporting for connectivity issues
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// ✅ FIX 1: Use env variables — never commit secrets to git
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ✅ FIX 2: Validate config before initializing
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missingKeys.length > 0) {
  console.error(
    `[Firebase] Missing environment variables: ${missingKeys.join(', ')}\n` +
    'Create a .env file at the root of your project with VITE_FIREBASE_* variables.'
  );
}

const app = initializeApp(firebaseConfig);

// ✅ FIX 3: firestoreDatabaseId is optional — default DB if not set
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;
export const db = firestoreDatabaseId
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Connectivity check — only in browser
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'ping'));
    console.log('[Firebase] Connection established ✓');
  } catch (error: any) {
    if (error?.message?.includes('offline') || error?.code === 'unavailable') {
      console.error('[Firebase] Offline — check your internet or Firebase config.');
    }
    // Silently ignore "permission-denied" (expected for unauthenticated ping)
    // The important thing is the SDK initialized
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}
