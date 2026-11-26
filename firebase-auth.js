// Firebase Google sign-in and Micaplan cloud save/restore.
// Connect this module by adding `import './firebase-auth.js';` beside the imports
// at the top of index.html's existing <script type="module">.
import { firebaseApp, db } from './firebase.js';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';

const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();
const style = document.createElement('style');
style.textContent = `
  #micaplanCloud{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 10px;background:#20242b;color:#f2f3f5;border-bottom:1px solid #383e48;font:14px system-ui,sans-serif}
  #micaplanCloud button{padding:7px 10px;border:1px solid #59616e;border-radius:8px;background:#292e37;color:inherit;font:inherit}
  #micaplanCloud button:disabled{opacity:.55}
  #micaplanCloudStatus{color:#a9afb9}
`;
document.head.append(style);
const bar = document.createElement('div');
bar.id = 'micaplanCloud';
bar.innerHTML = '<span id="micaplanCloudStatus">Firebase : déconnecté</span><button id="micaplanGoogle">Connexion Google</button><button id="micaplanSaveCloud" disabled>Enregistrer dans le cloud</button><button id="micaplanLoadCloud" disabled>Restaurer du cloud</button><button id="micaplanSignOut" hidden>Déconnexion</button>';
document.body.prepend(bar);

const status = document.querySelector('#micaplanCloudStatus');
const googleButton = document.querySelector('#micaplanGoogle');
const saveButton = document.querySelector('#micaplanSaveCloud');
const loadButton = document.querySelector('#micaplanLoadCloud');
const signOutButton = document.querySelector('#micaplanSignOut');
const setStatus = (message) => { status.textContent = message; };
const projectRef = (uid) => doc(db, 'users', uid, 'projects', 'current');

// Mobile browsers generally handle redirect sign-in more reliably than popups.
googleButton.addEventListener('click', async () => {
  googleButton.disabled = true;
  try {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      await signInWithRedirect(auth, provider);
    } else {
      await signInWithPopup(auth, provider);
    }
  } catch (error) {
    setStatus(`Connexion impossible : ${error.message}`);
    googleButton.disabled = false;
  }
});
signOutButton.addEventListener('click', () => signOut(auth).catch((error) => setStatus(error.message)));

onAuthStateChanged(auth, (user) => {
  googleButton.hidden = Boolean(user);
  googleButton.disabled = false;
  signOutButton.hidden = !user;
  saveButton.disabled = !user;
  loadButton.disabled = !user;
  setStatus(user ? `Connecté : ${user.email || user.displayName || 'compte Google'}` : 'Firebase : déconnecté');
});

async function saveCloud() {
  const user = auth.currentUser;
  if (!user) throw new Error('Connecte-toi avec Google avant la sauvegarde.');
  // The existing Micaplan save button stores the current model in this key.
  const raw = localStorage.getItem('micaplan3d');
  if (!raw) throw new Error('Appuie d’abord sur « Enregistrer » dans Micaplan, puis réessaie.');
  const data = JSON.parse(raw);
  await setDoc(projectRef(user.uid), {
    name: String(data.name || 'Mon projet').slice(0, 120),
    data,
    updatedAt: serverTimestamp(),
  });
  setStatus('Projet enregistré dans Firebase.');
}
saveButton.addEventListener('click', async () => {
  saveButton.disabled = true;
  try { await saveCloud(); }
  catch (error) { setStatus(`Échec de sauvegarde : ${error.message}`); }
  finally { saveButton.disabled = !auth.currentUser; }
});

loadButton.addEventListener('click', async () => {
  loadButton.disabled = true;
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Connecte-toi avec Google.');
    const snapshot = await getDoc(projectRef(user.uid));
    if (!snapshot.exists()) throw new Error('Aucune sauvegarde cloud. Enregistre d’abord un projet.');
    const data = snapshot.data().data;
    const input = document.querySelector('#fileInput');
    if (input && typeof DataTransfer !== 'undefined') {
      const transfer = new DataTransfer();
      transfer.items.add(new File([JSON.stringify(data)], 'micaplan-cloud.json', { type: 'application/json' }));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      setStatus('Sauvegarde cloud restaurée.');
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      link.download = 'micaplan-cloud.json';
      link.click();
      URL.revokeObjectURL(link.href);
      setStatus('JSON téléchargé : importe-le dans Micaplan.');
    }
  } catch (error) { setStatus(`Échec de restauration : ${error.message}`); }
  finally { loadButton.disabled = !auth.currentUser; }
});

// Keep the cloud copy synchronized after the app's existing local save action.
document.querySelector('#save')?.addEventListener('click', () => {
  if (auth.currentUser) setTimeout(() => saveCloud().catch((error) => setStatus(`Sauvegarde cloud non effectuée : ${error.message}`)), 0);
});
