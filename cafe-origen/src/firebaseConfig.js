import { initializeApp } from "firebase/app";

import {
  getAuth
} from "firebase/auth";

import {
  getFirestore
} from "firebase/firestore";


// =====================================================
// CONFIGURACIÓN FIREBASE
// =====================================================

const firebaseConfig = {

  apiKey:
    "AIzaSyBnAuoPtwbDWhlOb70jxk-h1mfhNIhfoLI",

  authDomain:
    "pory-2b6f5.firebaseapp.com",

  projectId:
    "pory-2b6f5",

  storageBucket:
    "pory-2b6f5.firebasestorage.app",

  messagingSenderId:
    "967476599371",

  appId:
    "1:967476599371:web:a493d7d8cfa858782acbce"

};


// =====================================================
// INICIALIZAR FIREBASE
// =====================================================

const app =
  initializeApp(firebaseConfig);


// =====================================================
// AUTHENTICATION
// =====================================================

export const auth =
  getAuth(app);


// =====================================================
// FIRESTORE
// =====================================================

export const db =
  getFirestore(app);


// =====================================================
// EXPORT APP
// =====================================================

export default app;