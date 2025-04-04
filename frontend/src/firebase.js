// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Adăugăm importul pentru Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyCiNr90PpncZHE7MxtmBd9rm2SPesfp8E0",
  authDomain: "cofetarie-artizanala.firebaseapp.com",
  projectId: "cofetarie-artizanala",
  storageBucket: "cofetarie-artizanala.appspot.com",
  messagingSenderId: "993434277280",
  appId: "1:993434277280:web:cc7cf989e15cf0e44500c5",
  measurementId: "G-JF987TK9VW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Inițializăm Firebase Storage

setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Eroare la setarea persistenței:", error);
  });

// Exportăm și storage împreună cu db și auth
export { db, auth, storage };