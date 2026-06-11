import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyChunG8tXYQ84gLb6MY52ou4V7w2iBBBpA",
  authDomain: "tmrs-dbac7.firebaseapp.com",
  databaseURL: "",
  projectId: "tmrs-dbac7",
  storageBucket: "tmrs-dbac7.firebasestorage.app",
  messagingSenderId: "388308207843",
  appId: "1:388308207843:web:a60620e90ce65f8ac75dd6",
  measurementId: "G-PN3J43PVFE",
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



