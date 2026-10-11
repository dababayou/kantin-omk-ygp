/**
 * State Management & LocalStorage + Firebase Firestore Sync untuk Kantin OMK YGP
 */

import { DEFAULT_TEMPLATE_ITEMS } from './templateData.js';
import { firebaseService } from './firebaseService.js';

const STORAGE_KEY_CURRENT = 'kantin_omk_ygp_current_session_v1';
const STORAGE_KEY_TEMPLATES = 'kantin_omk_ygp_templates_v1';
const STORAGE_KEY_HISTORY = 'kantin_omk_ygp_history_v1';
const STORAGE_KEY_UI = 'kantin_omk_ygp_ui_settings_v1';

class Store {
  constructor() {
    this.subscribers = [];
    this.cloudStatus = firebaseService.isReady() ? 'connected' : 'offline';
    this.cloudSaveTimer = null;
    this.isReceivingRemoteUpdate = false;

    this.templates = this.loadTemplates();
    this.history = this.loadHistory();
    this.uiSettings = this.loadUiSettings();
    this.currentSession = this.loadCurrentSession();

    if (!this.currentSession) {
      this.currentSession = this.createDefaultSession();
      this.saveCurrentSession();
    }

    // Mulai sinkronisasi cloud jika Firebase aktif
    this.initCloudSync();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify(shouldSyncCloud = true) {
    this.saveCurrentSession();
    this.subscribers.forEach(cb => cb(this.getState()));

    if (shouldSyncCloud && !this.isReceivingRemoteUpdate) {
      this.triggerCloudSave();
    }
  }

  getState() {
    return {
      currentSession: this.currentSession,
      templates: this.templates,
      history: this.history,
      uiSettings: this.uiSettings,
      cloudStatus: this.cloudStatus,
      isFirebaseReady: firebaseService.isReady()
    };
  }

  // --- CLOUD SYNC LOGIC ---
  initCloudSync() {
    if (!firebaseService.isReady()) {
      this.cloudStatus = 'offline';
      return;
    }

    this.cloudStatus = 'connected';
    console.log('Attaching realtime listener to Firestore...');

    firebaseService.listenToActiveSession((remoteSession) => {
      if (!remoteSession || !remoteSession.id) return;

      const localUpdated = new Date(this.currentSession?.updatedAt || 0).getTime();
      const remoteUpdated = new Date(remoteSession.updatedAt || 0).getTime();

      // Jika data dari cloud lebih baru atau sesi berbeda
      if (remoteSession.id !== this.currentSession?.id || remoteUpdated > localUpdated) {
        console.log('Menerima update realtime dari cloud...', remoteSession.id);
        this.isReceivingRemoteUpdate = true;
        this.currentSession = remoteSession;
        this.saveCurrentSession();
        this.notify(false); // notify subscribers tanpa re-push ke cloud
        this.isReceivingRemoteUpdate = false;
      }
    }, (err) => {
      console.warn('Realtime sync status error:', err);
      this.cloudStatus = 'error';
      this.subscribers.forEach(cb => cb(this.getState()));
    });
  }

  triggerCloudSave() {
    if (!firebaseService.isReady() || !this.currentSession) return;

    this.cloudStatus = 'saving';
    this.subscribers.forEach(cb => cb(this.getState()));

    clearTimeout(this.cloudSaveTimer);
    this.cloudSaveTimer = setTimeout(async () => {
      const ok = await firebaseService.saveSessionToCloud(this.currentSession);
      this.cloudStatus = ok ? 'connected' : 'error';
      this.subscribers.forEach(cb => cb(this.getState()));
    }, 400); // Debounce 400ms agar efisien saat multi-tap tombol tally
  }

  // --- STORAGE HELPERS ---
  loadTemplates() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load templates:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_TEMPLATE_ITEMS));
  }

  saveTemplates(templates) {
    this.templates = templates;
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(this.templates));
    } catch (e) {
      console.error(e);
    }
    this.notify();
  }

  loadHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load history:', e);
    }
    return [];
  }

  saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this.history));
    } catch (e) {
      console.error(e);
    }
  }

  loadUiSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_UI);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {
      theme: 'light',
      viewMode: 'cards', // 'cards' | 'table'
      activeCategory: 'Semua',
      activeTab: 'cashier' // 'prep' | 'cashier' | 'closing' | 'templates' | 'history'
    };
  }

  updateUiSettings(newSettings) {
    this.uiSettings = { ...this.uiSettings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEY_UI, JSON.stringify(this.uiSettings));
    } catch (e) {}
    this.notify(false);
  }

  loadCurrentSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load current session:', e);
    }
    return null;
  }

  saveCurrentSession() {
    try {
      if (this.currentSession) {
        if (!this.isReceivingRemoteUpdate) {
          this.currentSession.updatedAt = new Date().toISOString();
        }
        localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(this.currentSession));
      }
    } catch (e) {
      console.error(e);
    }
  }

  // --- SESSION CREATION & 2-PHASE WORKFLOW ---
  createDefaultSession(shiftName = 'Misa Minggu', picName = 'Tim OMK YGP') {
    const todayStr = new Date().toISOString().split('T')[0];
    const items = this.templates.map(tpl => ({
      id: tpl.id || 'item-' + Math.random().toString(36).substr(2, 9),
      name: tpl.name,
      category: tpl.category || 'Lainnya',
      price: Number(tpl.price) || 0,
      initialStock: Number(tpl.defaultStock) || 0,
      initialStockChecked: false,
      soldCash: 0,
      soldQris: 0,
      remainingReal: null,
      remainingRealChecked: false,
      notes: ''
    }));

    return {
      id: 'session-' + Date.now(),
      date: todayStr,
      shiftName: shiftName,
      picName: picName,
      initialCash: 150000, // Standar uang modal kembalian Rp 150.000
      items: items,
      reconciliation: {
        manualCashInHand: 0,
        manualQrisVerified: 0,
        notes: ''
      },
      status: 'active',
      stage: 'preparation', // 'preparation' (H-1) | 'prepared' | 'live' (Hari-H) | 'closed'
      preparedBy: 'Tim Logistik OMK',
      preparedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  resetCurrentSession(confirmPrompt = true) {
    this.currentSession = this.createDefaultSession(
      this.currentSession?.shiftName || 'Misa Minggu',
      this.currentSession?.picName || 'Tim OMK YGP'
    );
    this.notify();
  }

  // Aksi Khusus: Simpan Persiapan Stok H-1
  async savePreparationH1(prepData) {
    if (!this.currentSession) return;
    this.currentSession = {
      ...this.currentSession,
      ...prepData,
      stage: 'prepared',
      preparedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.notify();
    if (firebaseService.isReady()) {
      await firebaseService.savePreparationH1(this.currentSession);
    }
  }

  // Aksi Khusus: Mulai Operasional Kasir Hari-H
  activateHariH() {
    if (!this.currentSession) return;
    this.currentSession.stage = 'live';
    this.currentSession.updatedAt = new Date().toISOString();
    this.notify();
  }

  updateSessionMeta(fields) {
    if (!this.currentSession) return;
    this.currentSession = {
      ...this.currentSession,
      ...fields
    };
    this.notify();
  }

  // --- ITEM INTERACTIONS ---
  updateItem(itemId, fields) {
    if (!this.currentSession) return;
    this.currentSession.items = this.currentSession.items.map(item => {
      if (item.id === itemId) {
        return { ...item, ...fields };
      }
      return item;
    });
    this.notify();
  }

  incrementSold(itemId, type = 'cash', delta = 1) {
    if (!this.currentSession) return;
    this.currentSession.items = this.currentSession.items.map(item => {
      if (item.id === itemId) {
        if (type === 'cash') {
          const newVal = Math.max(0, (item.soldCash || 0) + delta);
          return { ...item, soldCash: newVal };
        } else if (type === 'qris') {
          const newVal = Math.max(0, (item.soldQris || 0) + delta);
          return { ...item, soldQris: newVal };
        }
      }
      return item;
    });
    this.notify();
  }

  setSoldAmount(itemId, type, value) {
    if (!this.currentSession) return;
    const val = Math.max(0, parseInt(value, 10) || 0);
    this.currentSession.items = this.currentSession.items.map(item => {
      if (item.id === itemId) {
        if (type === 'cash') return { ...item, soldCash: val };
        if (type === 'qris') return { ...item, soldQris: val };
        if (type === 'total') {
          const currentTotal = (item.soldCash || 0) + (item.soldQris || 0);
          const diff = val - currentTotal;
          return { ...item, soldCash: Math.max(0, (item.soldCash || 0) + diff) };
        }
      }
      return item;
    });
    this.notify();
  }

  setInitialStock(itemId, stock) {
    const val = Math.max(0, parseInt(stock, 10) || 0);
    this.updateItem(itemId, { initialStock: val });
  }

  toggleInitialCheck(itemId, checked) {
    this.updateItem(itemId, { initialStockChecked: Boolean(checked) });
  }

  checkAllInitialStock(checked = true) {
    if (!this.currentSession) return;
    this.currentSession.items = this.currentSession.items.map(item => ({
      ...item,
      initialStockChecked: checked
    }));
    this.notify();
  }

  setRemainingReal(itemId, val) {
    const parsed = val === '' ? null : Math.max(0, parseInt(val, 10) || 0);
    this.updateItem(itemId, { remainingReal: parsed });
  }

  toggleRemainingCheck(itemId, checked) {
    this.updateItem(itemId, { remainingRealChecked: Boolean(checked) });
  }

  checkAllRemainingStock(checked = true) {
    if (!this.currentSession) return;
    this.currentSession.items = this.currentSession.items.map(item => ({
      ...item,
      remainingRealChecked: checked
    }));
    this.notify();
  }

  syncAllRemainingWithSystem() {
    if (!this.currentSession) return;
    this.currentSession.items = this.currentSession.items.map(item => {
      const sold = (item.soldCash || 0) + (item.soldQris || 0);
      const rem = Math.max(0, (item.initialStock || 0) - sold);
      return {
        ...item,
        remainingReal: rem,
        remainingRealChecked: true
      };
    });
    this.notify();
  }

  addItemToCurrentSession(itemData) {
    if (!this.currentSession) return;
    const newItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      name: itemData.name.trim(),
      category: itemData.category || 'Lainnya',
      price: Math.max(0, Number(itemData.price) || 0),
      initialStock: Math.max(0, Number(itemData.initialStock) || 0),
      initialStockChecked: false,
      soldCash: 0,
      soldQris: 0,
      remainingReal: null,
      remainingRealChecked: false,
      notes: ''
    };
    this.currentSession.items.push(newItem);
    this.notify();
  }

  removeItemFromCurrentSession(itemId) {
    if (!this.currentSession) return;
    this.currentSession.items = this.currentSession.items.filter(item => item.id !== itemId);
    this.notify();
  }

  // --- RECONCILIATION ACTIONS ---
  updateReconciliation(manualCashInHand, manualQrisVerified, notes) {
    if (!this.currentSession) return;
    this.currentSession.reconciliation = {
      manualCashInHand: manualCashInHand !== undefined ? Number(manualCashInHand) || 0 : (this.currentSession.reconciliation?.manualCashInHand || 0),
      manualQrisVerified: manualQrisVerified !== undefined ? Number(manualQrisVerified) || 0 : (this.currentSession.reconciliation?.manualQrisVerified || 0),
      notes: notes !== undefined ? notes : (this.currentSession.reconciliation?.notes || '')
    };
    this.notify();
  }

  // --- HISTORY & ARCHIVE ---
  archiveCurrentSession() {
    if (!this.currentSession) return;
    const archived = {
      ...JSON.parse(JSON.stringify(this.currentSession)),
      archivedAt: new Date().toISOString(),
      status: 'closed',
      stage: 'closed'
    };
    const existingIndex = this.history.findIndex(h => h.id === archived.id);
    if (existingIndex >= 0) {
      this.history[existingIndex] = archived;
    } else {
      this.history.unshift(archived);
    }
    this.saveHistory();
    this.notify();
  }

  loadArchivedSession(id) {
    const session = this.history.find(h => h.id === id);
    if (session) {
      this.currentSession = JSON.parse(JSON.stringify(session));
      this.notify();
      return true;
    }
    return false;
  }

  deleteArchivedSession(id) {
    this.history = this.history.filter(h => h.id !== id);
    this.saveHistory();
    this.notify(false);
  }

  // --- TEMPLATES MANAGEMENT ---
  addTemplateItem(item) {
    const newItem = {
      id: 'tpl-' + Date.now(),
      name: item.name.trim(),
      category: item.category || 'Lainnya',
      price: Math.max(0, Number(item.price) || 0),
      defaultStock: Math.max(0, Number(item.defaultStock) || 0)
    };
    this.templates.push(newItem);
    this.saveTemplates(this.templates);
  }

  updateTemplateItem(id, itemData) {
    this.templates = this.templates.map(tpl => {
      if (tpl.id === id) {
        return {
          ...tpl,
          name: itemData.name.trim(),
          category: itemData.category || 'Lainnya',
          price: Math.max(0, Number(itemData.price) || 0),
          defaultStock: Math.max(0, Number(itemData.defaultStock) || 0)
        };
      }
      return tpl;
    });
    this.saveTemplates(this.templates);
  }

  deleteTemplateItem(id) {
    this.templates = this.templates.filter(tpl => tpl.id !== id);
    this.saveTemplates(this.templates);
  }

  resetTemplatesToDefault() {
    this.templates = JSON.parse(JSON.stringify(DEFAULT_TEMPLATE_ITEMS));
    this.saveTemplates(this.templates);
  }

  // --- TEAM SHARING & TRANSFER ---
  exportSessionCode() {
    if (!this.currentSession) return '';
    return encodeSessionData(this.currentSession);
  }

  importSessionCode(codeStr) {
    const data = decodeSessionData(codeStr);
    if (!data) return false;
    this.currentSession = data;
    this.notify();
    return true;
  }
}

export function encodeSessionData(session) {
  try {
    const jsonStr = JSON.stringify(session);
    return btoa(encodeURIComponent(jsonStr));
  } catch (e) {
    console.error('Failed to encode session:', e);
    return '';
  }
}

export function decodeSessionData(encodedStr) {
  try {
    const cleanStr = encodedStr.trim().replace(/^#session=/, '');
    const jsonStr = decodeURIComponent(atob(cleanStr));
    const parsed = JSON.parse(jsonStr);
    if (parsed && Array.isArray(parsed.items)) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to decode session:', e);
  }
  return null;
}

export const store = new Store();
