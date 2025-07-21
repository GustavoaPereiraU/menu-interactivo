import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getDatabase, ref, set, push, get, child, update, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDEnhh2JostypNUHOmSbLXNefyeEYDnvFY",
  authDomain: "app-dj-f50c9.firebaseapp.com",
  databaseURL: "https://app-dj-f50c9-default-rtdb.firebaseio.com",
  projectId: "app-dj-f50c9",
  storageBucket: "app-dj-f50c9.appspot.com",
  messagingSenderId: "493254363361",
  appId: "1:493254363361:web:db60e325ab67bd8cd1cfa0",
  measurementId: "G-E55ELMZQWT"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const auth = getAuth(app);

// Exportar todo lo necesario
export {
  db, ref, set, push, get, child, update, onValue, remove,
  auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously
};
