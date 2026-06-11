importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js"
);

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

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message",
    payload
  );
  const notificationTitle = payload.notification?.title || "Background Title";
  const notificationOptions = {
    body: payload.notification?.body || "Background Body",
    icon: "/icons/icon-128x128.png",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});



