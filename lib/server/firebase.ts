import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirestore, type Firestore } from 'firebase-admin/firestore';

let firestore: Firestore | null = null;

export function adminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

function adminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  if (!adminConfigured()) {
    throw new Error(
      'Firebase Admin chưa được cấu hình. Hãy điền FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL và FIREBASE_PRIVATE_KEY trong file .env hoặc .env.local.',
    );
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

export function adminDb() {
  if (!firestore) {
    firestore = initializeFirestore(adminApp(), { preferRest: true });
  }
  return firestore;
}

export function adminAuth() {
  return getAuth(adminApp());
}
