import { initializeApp } from "firebase/app";
import { getFirestore, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAA5n6hIhS_pZkeRlbgXBPgaQQWo6g45sY",
  authDomain: "policy-compass-parthm.firebaseapp.com",
  projectId: "policy-compass-parthm",
  storageBucket: "policy-compass-parthm.firebasestorage.app",
  messagingSenderId: "821964110611",
  appId: "1:821964110611:web:29856d8c39c1ce5d7b38e6"
};

//init firebase
initializeApp(firebaseConfig);

//init firestore
const db = getFirestore();

//init firebase auth
const auth = getAuth();

//timestamp
const timestamp = Timestamp;

export { db, auth, timestamp };



