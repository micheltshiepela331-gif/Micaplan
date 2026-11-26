// Firebase browser setup for Micaplan.
// This file is an ES module; import it from index.html's existing <script type="module">.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import { getAnalytics, isSupported } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-analytics.js';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBsOcp3Y0vKx8tNPfxYJ1hSwDkEs8PO9hs',
  authDomain: 'micaplan-e5ea4.firebaseapp.com',
  projectId: 'micaplan-e5ea4',
  storageBucket: 'micaplan-e5ea4.firebasestorage.app',
  messagingSenderId: '1044679130086',
  appId: '1:1044679130086:web:060008d137c6c754497427',
  measurementId: 'G-CLD83CNVEB',
};

export const firebaseApp = initializeApp(firebaseConfig);

// Analytics is unavailable in some browsers, local previews, and privacy modes.
export const analyticsReady = isSupported()
  .then((supported) => supported ? getAnalytics(firebaseApp) : null)
  .catch((error) => {
    console.info('Firebase Analytics is unavailable in this browser.', error);
    return null;
  });

// Keep Firestore data in IndexedDB for offline reads/writes. Multi-tab cache
// support avoids persistence conflicts when Micaplan is open in more than one tab.
let firestore;
try {
  firestore = initializeFirestore(firebaseApp, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (error) {
  // Fallback for browsers that cannot initialize persistent IndexedDB caching.
  console.info('Firestore persistent cache is unavailable; using the default cache.', error);
  firestore = getFirestore(firebaseApp);
}
export const db = firestore;
