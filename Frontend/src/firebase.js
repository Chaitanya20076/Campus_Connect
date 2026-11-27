
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlztmCjl0Q6GA51-NCtM_ew_XGKYhEKvk",
  authDomain: "campusconnect-99079.firebaseapp.com",
  projectId: "campusconnect-99079",
  storageBucket: "campusconnect-99079.firebasestorage.app",
  messagingSenderId: "878399155893",
  appId: "1:878399155893:web:9042b6582aa27dca7c18fc"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
