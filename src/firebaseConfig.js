import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ตั้งค่า Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBGDJWD7mSyNXxC0Q4moMEtcgpZFzbYFlY",
  authDomain: "fkorn4242.firebaseapp.com",
  projectId: "fkorn4242",
  storageBucket: "fkorn4242.firebasestorage.app", 
  messagingSenderId: "1081501019973",
  appId: "1:1081501019973:web:2ce824ce6ed9e5bb97982c",
  measurementId: "G-MPJK09B8TD"
};

// เริ่มต้น Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db};
