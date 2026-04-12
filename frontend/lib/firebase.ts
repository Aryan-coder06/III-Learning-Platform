import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXdBYH6glY5U8gLVuDZEa_M1y1RU_ZBWw",
  authDomain: "studysync-fbcda.firebaseapp.com",
  projectId: "studysync-fbcda",
  storageBucket: "studysync-fbcda.firebasestorage.app",
  messagingSenderId: "351071677141",
  appId: "1:351071677141:web:48f28617678af8cbb2505c",
  measurementId: "G-C6S5HX5GFN"
};

// Initialize Firebase (SSR friendly)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
