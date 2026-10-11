/**
 * Konfigurasi Firebase Firestore untuk Kantin OMK YGP
 * Menggunakan Firebase Modular Web SDK v10
 */

// Import Firebase SDK dari CDN resmi Google
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { 
  getFirestore, 
  enableIndexedDbPersistence 
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

const STORAGE_KEY_FIREBASE_CONFIG = 'kantin_omk_ygp_firebase_config_v1';

// Default config placeholder (Dapat diisi langsung di sini atau melalui dialog Pengaturan Cloud di Web UI)
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

let app = null;
let db = null;
let isConfigured = false;

export function loadSavedFirebaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved firebase config', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
    return initFirebase(config);
  } catch (e) {
    console.error('Failed to save firebase config', e);
    return false;
  }
}

export function initFirebase(config = null) {
  const activeConfig = config || loadSavedFirebaseConfig();

  // Validasi minimal ada projectId dan apiKey
  if (!activeConfig || !activeConfig.projectId || !activeConfig.apiKey) {
    isConfigured = false;
    db = null;
    return { success: false, reason: 'Config belum diisi' };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(activeConfig);
    } else {
      app = getApp();
    }

    db = getFirestore(app);
    isConfigured = true;
    console.log('Firebase Firestore Kantin OMK YGP initialized with project:', activeConfig.projectId);
    return { success: true, db };
  } catch (err) {
    console.error('Gagal menginisialisasi Firebase:', err);
    isConfigured = false;
    db = null;
    return { success: false, reason: err.message };
  }
}

// Inisialisasi otomatis jika config sudah tersimpan
const initialInit = initFirebase();

export { app, db, isConfigured };
