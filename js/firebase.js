import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeBAzwjuur6lds6MVabN1hT8NggnbkYUY",
  authDomain: "opportunity-hub-fb5b6.firebaseapp.com",
  projectId: "opportunity-hub-fb5b6",
  storageBucket: "opportunity-hub-fb5b6.firebasestorage.app",
  messagingSenderId: "1038293665565",
  appId: "1:1038293665565:web:bdadf4325bfe56281403f4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
};
