import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBmch3h8GcEIS2ggdwWuQ8JwmHUvqJF8no",
  authDomain: "tagam-7d162.firebaseapp.com",
  projectId: "tagam-7d162",
  storageBucket: "tagam-7d162.firebasestorage.app",
  messagingSenderId: "85413186790",
  appId: "1:85413186790:web:a7a1c60a65a1ce4c91ff27",
  measurementId: "G-FYCDJ7RW4Z",
};

const firebaseCollectionEnum = {
  chats: "chats",
  limit: 50,
  drivers: "drivers",
};

const firebaasApp = initializeApp(firebaseConfig);
const firebaseDb = getFirestore(firebaasApp);

let firebaseMessaging = null;

const is_messaging_supported =
  "Notification" in window &&
  "serviceWorker" in navigator &&
  "PushManager" in window;
if (is_messaging_supported) {
  try {
    firebaseMessaging = getMessaging(firebaasApp);
  } catch (err) {
    console.warn(
      "Firebase Messaging is not supported in this environment:",
      err
    );
  }
}

export {
  firebaseDb,
  firebaseCollectionEnum,
  firebaseMessaging,
  getToken,
  onMessage,
};
