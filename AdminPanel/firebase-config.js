// firebase-config.js
console.log("Initializing Firebase...");

// Firebase v8 SDK Imports (loaded via script tags in HTML)
const firebaseConfig = {
  apiKey: "AIzaSyAvvhMpf_WitusAfR-sqI8pMLIAPqygOOY",
  authDomain: "everpeak-df533.firebaseapp.com",
  projectId: "everpeak-df533",
  storageBucket: "everpeak-df533.firebasestorage.app",
  messagingSenderId: "314009845647",
  appId: "1:314009845647:web:60381fba9cbecb51c395fa",
  measurementId: "G-0XEXF5JSZ8"
};

// Ensure Firebase doesn't initialize twice
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

// Make Firebase services available globally
window.db = firebase.firestore();
window.auth = firebase.auth();

console.log("✅ Firebase is ready to use.");
