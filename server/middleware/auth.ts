import type { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Read config safely for ESM
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccountVar) {
    try {
      // Handle potential extra quoting or escaping from environment variables
      let cleaned = serviceAccountVar.trim();
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1).replace(/\\"/g, '"');
      }
      
      const serviceAccount = JSON.parse(cleaned);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized with service account from env.');
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY from env, falling back to default:', error);
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
  } else {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
}

export default admin;

// Export Firestore instance with the correct databaseId
export const db = admin.firestore(firebaseConfig.firestoreDatabaseId || undefined);

export interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
