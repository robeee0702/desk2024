// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDmpBvRECtTGv4G8SotQn_U4zFhV5RVnNU",
  authDomain: "desk2024-29cc4.firebaseapp.com",
  databaseURL: "https://desk2024-29cc4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "desk2024-29cc4",
  storageBucket: "desk2024-29cc4.appspot.com",
  messagingSenderId: "217230447658",
  appId: "1:217230447658:web:361875e01375ca1e5d5f53",
  measurementId: "G-MTQ1F6WQ59",
  databaseURL: 'https://desk2024-29cc4-default-rtdb.europe-west1.firebasedatabase.app'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const storage = getStorage(app);

export { database, storage };