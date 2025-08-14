import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA7r9IuqmXYUpEJ1CYVVNx9iRFqKY3P450",
    authDomain: "realtimetracker-703cb.firebaseapp.com",
    projectId: "realtimetracker-703cb",
    storageBucket: "realtimetracker-703cb.firebasestorage.app",
    messagingSenderId: "945284286927",
    appId: "1:945284286927:web:ca3135ea2d118b71f2eaba",
    measurementId: "G-YDWLEDFEDC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.appId;

export { app, auth, db, appId };