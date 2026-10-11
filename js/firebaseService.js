/**
 * Firebase Firestore Service untuk Sinkronisasi Realtime Kantin OMK YGP
 */

import { db, isConfigured } from './firebaseConfig.js';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

let activeUnsubscribe = null;

export const firebaseService = {
  // Mengecek apakah koneksi Firebase siap
  isReady() {
    return isConfigured && db !== null;
  },

  // Menyimpan sesi saat ini ke Cloud dan menjadikannya sesi aktif
  async saveSessionToCloud(session) {
    if (!this.isReady()) return false;
    try {
      const sessionDocRef = doc(db, 'kantin_sessions', session.id);
      const activePointerRef = doc(db, 'kantin_active_session', 'current');

      const payload = {
        ...session,
        updatedAt: new Date().toISOString()
      };

      // Simpan di koleksi sesi
      await setDoc(sessionDocRef, payload, { merge: true });
      // Simpan pointer sesi aktif saat ini agar seluruh perangkat HP langsung sinkron
      await setDoc(activePointerRef, {
        activeSessionId: session.id,
        sessionData: payload,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return true;
    } catch (err) {
      console.error('Error saving session to Firestore:', err);
      return false;
    }
  },

  // Menyimpan persiapan H-1 (Set Stok Awal)
  async savePreparationH1(session) {
    if (!this.isReady()) return false;
    try {
      const payload = {
        ...session,
        stage: 'prepared', // Status: sudah disiapkan tim H-1
        preparedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return await this.saveSessionToCloud(payload);
    } catch (err) {
      console.error('Error saving H-1 preparation:', err);
      return false;
    }
  },

  // Mendengarkan perubahan sesi aktif secara Realtime (onSnapshot)
  listenToActiveSession(onDataReceived, onError) {
    if (!this.isReady()) return null;

    // Bersihkan listener sebelumnya jika ada
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }

    try {
      const activePointerRef = doc(db, 'kantin_active_session', 'current');
      activeUnsubscribe = onSnapshot(activePointerRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.sessionData) {
            onDataReceived(data.sessionData);
          }
        }
      }, (err) => {
        console.warn('Realtime listener error:', err);
        if (onError) onError(err);
      });

      return activeUnsubscribe;
    } catch (err) {
      console.error('Failed to attach realtime listener:', err);
      if (onError) onError(err);
      return null;
    }
  },

  // Mengambil sesi aktif dari cloud (sekali baca)
  async getActiveSessionFromCloud() {
    if (!this.isReady()) return null;
    try {
      const activePointerRef = doc(db, 'kantin_active_session', 'current');
      const docSnap = await getDoc(activePointerRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.sessionData || null;
      }
    } catch (err) {
      console.error('Error fetching active session:', err);
    }
    return null;
  },

  // Mengambil seluruh riwayat sesi dari cloud
  async getCloudHistory() {
    if (!this.isReady()) return [];
    try {
      const q = query(collection(db, 'kantin_sessions'), orderBy('updatedAt', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach(docSnap => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      console.error('Error fetching history from Firestore:', err);
      return [];
    }
  },

  // Menghentikan listener realtime jika diperlukan
  stopListening() {
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }
  }
};
