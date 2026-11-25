
import "dotenv/config";
import admin from "firebase-admin";

let db = null;
let firebaseApp = null;

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} = process.env;

const firebaseConfigured =
  FIREBASE_PROJECT_ID &&
  FIREBASE_CLIENT_EMAIL &&
  FIREBASE_PRIVATE_KEY;

if (firebaseConfigured) {
  try {
    if (admin.apps.length > 0) {
      firebaseApp = admin.app();
    } else {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    }

    db = admin.firestore(firebaseApp);

    console.log("✅ Firebase Admin connected successfully");
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
  }
} else {
  console.warn(
    "⚠️ Firebase credentials missing. Firestore is not connected yet."
  );
}

export { admin, firebaseApp, db };
