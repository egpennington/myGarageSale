import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAf-oUA7dLA_quMyFZzSjmeC2RGS9LEvAc",
  authDomain: "mygaragesale-d1193.firebaseapp.com",
  projectId: "mygaragesale-d1193",
  storageBucket: "mygaragesale-d1193.firebasestorage.app",
  messagingSenderId: "852346052327",
  appId: "1:852346052327:web:3fc26ca627b36b6ef8cc42",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);