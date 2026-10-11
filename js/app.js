/**
 * Kantin OMK Paroki St. Yohanes Gabriel Perboyre (YGP)
 * Main Application Logic & Controller
 */

import { store } from './state.js';
import { CATEGORIES } from './templateData.js';
import {
  formatRupiah,
  parseNumber,
  calculateItemMetrics,
  calculateSessionSummary
} from './calculations.js';
import { generateWhatsAppReport } from './whatsapp.js';
import { saveFirebaseConfig, loadSavedFirebaseConfig, isConfigured } from './firebaseConfig.js';

// DOM Element References
const elements = {
  // Theme & Meta
  themeToggleBtn: document.getElementById('btn-toggle-theme'),
  metaDateDisplay: document.getElementById('meta-date-display'),
  metaShiftDisplay: document.getElementById('meta-shift-display'),
  metaPicDisplay: document.getElementById('meta-pic-display'),
  metaInitialCashDisplay: document.getElementById('meta-initial-cash-display'),
  btnEditSessionMeta: document.getElementById('btn-edit-session-meta'),
  btnNewSession: document.getElementById('btn-new-session'),
  btnQuickWa: document.getElementById('btn-quick-wa'),

  // Cloud Firebase Status & Modal
  btnCloudStatus: document.getElementById('btn-cloud-status'),
  cloudStatusText: document.getElementById('cloud-status-text'),
  modalFirebaseConfig: document.getElementById('modal-firebase-config'),
  fbConfigJson: document.getElementById('fb-config-json'),
  fbModalStatusBadge: document.getElementById('fb-modal-status-badge'),
  btnSaveFirebaseConfig: document.getElementById('btn-save-firebase-config'),

  // Sticky KPI Bar
  kpiExpectedRevenue: document.getElementById('kpi-expected-revenue'),
  kpiExpectedCash: document.getElementById('kpi-expected-cash'),
  kpiExpectedQris: document.getElementById('kpi-expected-qris'),
  kpiStockRatio: document.getElementById('kpi-stock-ratio'),
  kpiNetProfit: document.getElementById('kpi-net-profit'),

  // Tabs & Panels
  tabButtons: document.querySelectorAll('.tab-btn'),
  tabPanels: document.querySelectorAll('.tab-panel'),

  // Tab 1: Persiapan (H-1)
  prepStageBadge: document.getElementById('prep-stage-badge'),
  prepInputDate: document.getElementById('prep-input-date'),
  prepInputShift: document.getElementById('prep-input-shift'),
  prepInputPic: document.getElementById('prep-input-pic'),
  prepInputInitialCash: document.getElementById('prep-input-initial-cash'),
  prepTableBody: document.getElementById('prep-table-body'),
  btnPrepAddItem: document.getElementById('btn-prep-add-item'),
  prepTotalUnits: document.getElementById('prep-total-units'),
  prepTotalValue: document.getElementById('prep-total-value'),
  btnSavePrepCloud: document.getElementById('btn-save-prep-cloud'),
  btnGoToCashier: document.getElementById('btn-go-to-cashier'),

  // Tab 2: Cashier View (Hari-H)
  bannerPrepStatus: document.getElementById('banner-prep-status'),
  bannerPrepInfo: document.getElementById('banner-prep-info'),
  btnViewPrepDetails: document.getElementById('btn-view-prep-details'),
  searchInput: document.getElementById('search-input'),
  categoryPills: document.getElementById('category-pills'),
  viewModeCardsBtn: document.getElementById('view-mode-cards'),
  viewModeTableBtn: document.getElementById('view-mode-table'),
  cardsContainer: document.getElementById('cards-container'),
  tableContainer: document.getElementById('table-container'),
  tableBody: document.getElementById('table-body'),
  btnAddItemModal: document.getElementById('btn-add-item-modal'),
  checklistInitialProgress: document.getElementById('checklist-initial-progress'),
  btnCheckAllInitial: document.getElementById('btn-check-all-initial'),
  btnSyncRemaining: document.getElementById('btn-sync-remaining'),

  // Tab 3: Closing & Reconciliation
  heroFinalProfit: document.getElementById('hero-final-profit'),
  btnCopyWaClosing: document.getElementById('btn-copy-wa-closing'),
  btnSaveSessionArchive: document.getElementById('btn-save-session-archive'),
  btnPrintReport: document.getElementById('btn-print-report'),
  inputReconInitialCash: document.getElementById('input-recon-initial-cash'),
  reconSysRevenue: document.getElementById('recon-sys-revenue'),
  reconSysCash: document.getElementById('recon-sys-cash'),
  reconSysQris: document.getElementById('recon-sys-qris'),
  reconSysTargetCash: document.getElementById('recon-sys-target-cash'),
  inputReconQrisReal: document.getElementById('input-recon-qris-real'),
  reconQrisStatusBadge: document.getElementById('recon-qris-status-badge'),
  reconQrisSysCompare: document.getElementById('recon-qris-sys-compare'),
  reconQrisDiffVal: document.getElementById('recon-qris-diff-val'),
  inputReconCashReal: document.getElementById('input-recon-cash-real'),
  reconCashStatusBadge: document.getElementById('recon-cash-status-badge'),
  reconCashSysTarget: document.getElementById('recon-cash-sys-target'),
  reconCashDiffVal: document.getElementById('recon-cash-diff-val'),
  inputReconNotes: document.getElementById('input-recon-notes'),

  // Tab 4: Templates
  btnAddTemplateItem: document.getElementById('btn-add-template-item'),
  btnResetDefaultTemplates: document.getElementById('btn-reset-default-templates'),
  templateTableBody: document.getElementById('template-table-body'),

  // Tab 5: History
  btnExportBackupJson: document.getElementById('btn-export-backup-json'),
  historyListContainer: document.getElementById('history-list-container'),

  // Modals
  modalSessionMeta: document.getElementById('modal-session-meta'),
  metaInputDate: document.getElementById('meta-input-date'),
  metaInputShift: document.getElementById('meta-input-shift'),
  metaInputPic: document.getElementById('meta-input-pic'),
  metaInputInitialCash: document.getElementById('meta-input-initial-cash'),
  btnSaveSessionMeta: document.getElementById('btn-save-session-meta'),

  modalAddItem: document.getElementById('modal-add-item'),
  newItemName: document.getElementById('new-item-name'),
  newItemCategory: document.getElementById('new-item-category'),
  newItemPrice: document.getElementById('new-item-price'),
  newItemStock: document.getElementById('new-item-stock'),
  btnConfirmAddItem: document.getElementById('btn-confirm-add-item'),

  modalWhatsappPreview: document.getElementById('modal-whatsapp-preview'),
  whatsappPreviewText: document.getElementById('whatsapp-preview-text'),
  btnCopyWaModal: document.getElementById('btn-copy-wa-modal'),

  // Team Share & Import Modal
  btnShareSession: document.getElementById('btn-share-session'),
  modalShareSession: document.getElementById('modal-share-session'),
  shareLinkInput: document.getElementById('share-link-input'),
  btnCopyShareLink: document.getElementById('btn-copy-share-link'),
  btnWaShareLink: document.getElementById('btn-wa-share-link'),
  importCodeInput: document.getElementById('import-code-input'),
  btnConfirmImportCode: document.getElementById('btn-confirm-import-code'),

  toastContainer: document.getElementById('toast-container')
};

// UI State
let currentSearchQuery = '';
let currentCategoryFilter = 'Semua';

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
function showToast(message, icon = '✅') {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ==========================================================================
// THEME & INITIALIZATION
// ==========================================================================
function initTheme() {
  const { uiSettings } = store.getState();
  if (uiSettings.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    elements.themeToggleBtn.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    elements.themeToggleBtn.textContent = '🌙';
  }
}

elements.themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  store.updateUiSettings({ theme: newTheme });
  initTheme();
  showToast(newTheme === 'dark' ? 'Mode Gelap Aktif' : 'Mode Terang Aktif', newTheme === 'dark' ? '🌙' : '☀️');
});

// ==========================================================================
// TABS NAVIGATION
// ==========================================================================
function switchTab(tabId) {
  elements.tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  elements.tabPanels.forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabId}`);
  });
  store.updateUiSettings({ activeTab: tabId });
}

elements.tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
  });
});

// View mode switcher (Cards vs Table)
function setViewMode(mode) {
  store.updateUiSettings({ viewMode: mode });
  elements.viewModeCardsBtn.classList.toggle('active', mode === 'cards');
  elements.viewModeTableBtn.classList.toggle('active', mode === 'table');
  elements.cardsContainer.style.display = mode === 'cards' ? 'grid' : 'none';
  elements.tableContainer.style.display = mode === 'table' ? 'block' : 'none';
}

elements.viewModeCardsBtn.addEventListener('click', () => setViewMode('cards'));
elements.viewModeTableBtn.addEventListener('click', () => setViewMode('table'));

// ==========================================================================
// RENDER META & LIVE KPIS
// ==========================================================================
function renderMetaAndKpi(state) {
  const { currentSession, cloudStatus } = state;
  if (!currentSession) return;

  const summary = calculateSessionSummary(currentSession);

  // Cloud Status Indicator
  const currentCloud = cloudStatus || 'offline';
  elements.btnCloudStatus.className = `cloud-status-chip ${currentCloud}`;
  if (currentCloud === 'connected') {
    elements.cloudStatusText.textContent = 'Cloud Terhubung 🔥';
  } else if (currentCloud === 'saving') {
    elements.cloudStatusText.textContent = 'Menyimpan...';
  } else if (currentCloud === 'error') {
    elements.cloudStatusText.textContent = 'Gagal Sinkron ⚠️';
  } else {
    elements.cloudStatusText.textContent = 'Mode Lokal (Hubungkan)';
  }

  // Banner status persiapan di Tab Hari-H
  if (currentSession.stage === 'prepared') {
    elements.bannerPrepStatus.style.display = 'flex';
    elements.bannerPrepInfo.textContent = `Disiapkan oleh ${currentSession.preparedBy || 'Tim Logistik'} (${summary.totalInitialStock} unit stok siap diperiksa)`;
  } else {
    elements.bannerPrepStatus.style.display = 'none';
  }

  // Meta Bar
  if (currentSession.date) {
    const d = new Date(currentSession.date);
    elements.metaDateDisplay.textContent = isNaN(d) ? currentSession.date : d.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  elements.metaShiftDisplay.textContent = currentSession.shiftName || 'Misa Minggu';
  elements.metaPicDisplay.textContent = currentSession.picName || 'Tim OMK YGP';
  elements.metaInitialCashDisplay.textContent = formatRupiah(summary.initialCash);

  // Live KPI Summary
  elements.kpiExpectedRevenue.textContent = formatRupiah(summary.totalExpectedRevenue);
  elements.kpiExpectedCash.textContent = formatRupiah(summary.totalExpectedCash);
  elements.kpiExpectedQris.textContent = formatRupiah(summary.totalExpectedQris);
  elements.kpiStockRatio.textContent = `${summary.totalSoldUnits} / ${summary.totalRemainingStockSystem} pcs`;
  elements.kpiNetProfit.textContent = formatRupiah(summary.finalNetRevenueReal);

  // Checklist helper progress
  elements.checklistInitialProgress.textContent = `${summary.initialCheckedCount}/${summary.totalItemsCount} barang siap`;
  if (summary.isAllInitialChecked) {
    elements.checklistInitialProgress.innerHTML = `<span style="color: var(--accent-cash); font-weight: 700;">Semua ${summary.totalItemsCount} barang siap diperiksa! ✅</span>`;
  }
}

// ==========================================================================
// RENDER TAHAP 1: PERSIAPAN H-1
// ==========================================================================
function renderPrepView(state) {
  const { currentSession } = state;
  if (!currentSession) return;

  if (document.activeElement !== elements.prepInputDate) {
    elements.prepInputDate.value = currentSession.date || '';
  }
  if (document.activeElement !== elements.prepInputShift) {
    elements.prepInputShift.value = currentSession.shiftName || 'Misa Minggu';
  }
  if (document.activeElement !== elements.prepInputPic) {
    elements.prepInputPic.value = currentSession.preparedBy || 'Tim Logistik OMK';
  }
  if (document.activeElement !== elements.prepInputInitialCash) {
    elements.prepInputInitialCash.value = currentSession.initialCash !== undefined ? currentSession.initialCash : 150000;
  }

  // Stage badge
  if (currentSession.stage === 'prepared') {
    elements.prepStageBadge.style.background = 'var(--accent-cash-bg)';
    elements.prepStageBadge.style.color = 'var(--accent-cash)';
    elements.prepStageBadge.textContent = '✅ Siap untuk Hari-H';
  } else if (currentSession.stage === 'live') {
    elements.prepStageBadge.style.background = 'var(--primary-light)';
    elements.prepStageBadge.style.color = 'var(--primary)';
    elements.prepStageBadge.textContent = '🚀 Sedang Digunakan (Hari-H)';
  } else {
    elements.prepStageBadge.style.background = 'var(--accent-warn-bg)';
    elements.prepStageBadge.style.color = 'var(--accent-warn)';
    elements.prepStageBadge.textContent = 'Draft Persiapan H-1';
  }

  // Render Table Items
  const items = currentSession.items || [];
  elements.prepTableBody.innerHTML = '';

  let totalPrepUnits = 0;
  let totalPrepValue = 0;

  items.forEach((item, index) => {
    const stock = Number(item.initialStock) || 0;
    const price = Number(item.price) || 0;
    const estValue = stock * price;

    totalPrepUnits += stock;
    totalPrepValue += estValue;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="color: var(--text-muted); font-size: 0.75rem;">${index + 1}</td>
      <td>
        <strong>${item.name}</strong>
      </td>
      <td><span class="item-category-tag">${item.category || 'Snack'}</span></td>
      <td><strong>${formatRupiah(price)}</strong></td>
      <td>
        <input type="number" class="table-input-number inp-prep-stock" data-id="${item.id}" 
               value="${stock}" min="0" style="width: 70px; font-weight: 700; color: var(--primary);">
      </td>
      <td style="font-weight: 600;">${formatRupiah(estValue)}</td>
      <td>
        <button class="btn btn-outline btn-sm btn-delete-item" data-id="${item.id}" style="color: var(--accent-danger);" title="Hapus dari sesi">
          🗑️
        </button>
      </td>
    `;
    elements.prepTableBody.appendChild(row);
  });

  elements.prepTotalUnits.textContent = `${totalPrepUnits} pcs`;
  elements.prepTotalValue.textContent = formatRupiah(totalPrepValue);

  // Attach prep stock input listeners
  document.querySelectorAll('.inp-prep-stock').forEach(inp => {
    inp.onchange = () => {
      store.setInitialStock(inp.dataset.id, inp.value);
    };
  });
}

// ==========================================================================
// RENDER CATEGORY PILLS
// ==========================================================================
function renderCategoryPills() {
  elements.categoryPills.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const pill = document.createElement('button');
    pill.className = `cat-pill ${cat === currentCategoryFilter ? 'active' : ''}`;
    pill.textContent = cat;
    pill.addEventListener('click', () => {
      currentCategoryFilter = cat;
      renderCategoryPills();
      renderItems();
    });
    elements.categoryPills.appendChild(pill);
  });
}

// Filter items
function getFilteredItems(items) {
  return items.filter(item => {
    const matchesCategory = currentCategoryFilter === 'Semua' || item.category === currentCategoryFilter;
    const matchesSearch = !currentSearchQuery || item.name.toLowerCase().includes(currentSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

// ==========================================================================
// RENDER ITEMS: CARDS & TABLE
// ==========================================================================
function renderItems() {
  const { currentSession, uiSettings } = store.getState();
  if (!currentSession) return;

  const items = currentSession.items || [];
  const filtered = getFilteredItems(items);

  // 1. CARDS VIEW
  elements.cardsContainer.innerHTML = '';
  if (filtered.length === 0) {
    elements.cardsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 3rem 1rem; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
        <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔍</p>
        <p>Tidak ada barang yang cocok dengan filter "${currentSearchQuery || currentCategoryFilter}".</p>
      </div>
    `;
  } else {
    filtered.forEach(item => {
      const m = calculateItemMetrics(item);
      const isOutOfStock = m.remainingSystem === 0;

      const card = document.createElement('div');
      card.className = `item-card ${isOutOfStock ? 'out-of-stock' : ''}`;
      card.innerHTML = `
        <div class="card-header-row">
          <div class="item-title-group">
            <h4 class="item-name">${item.name}</h4>
            <span class="item-category-tag">${item.category || 'Snack'}</span>
          </div>
          <div class="item-price-badge">${formatRupiah(m.price)}</div>
        </div>

        <!-- Stok Awal & Crosscheck Awal -->
        <div class="stock-status-row">
          <div class="stock-initial-group">
            <label class="checkbox-custom" title="Centang saat menata dagangan di stan">
              <input type="checkbox" class="chk-initial" data-id="${item.id}" ${item.initialStockChecked ? 'checked' : ''}>
              <span>Awal:</span>
            </label>
            <input type="number" class="stock-initial-input inp-stock" data-id="${item.id}" value="${m.initialStock}" min="0">
          </div>
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">Sisa:</span>
            <span class="stock-remaining-badge ${isOutOfStock ? 'empty' : (m.remainingSystem <= 3 ? 'low' : '')}">
              ${m.remainingSystem} pcs
            </span>
          </div>
        </div>

        <!-- Tombol Tally Cepat (+ Cash & + QRIS) -->
        <div class="sold-action-container">
          <div class="sold-buttons-row">
            <button class="tally-btn tally-btn-cash btn-add-cash" data-id="${item.id}" title="Tambah 1 terjual tunai/cash">
              <span class="tally-btn-label">💵 + Tunai (Cash)</span>
              <span class="tally-btn-value">${m.soldCash}</span>
            </button>
            <button class="tally-btn tally-btn-qris btn-add-qris" data-id="${item.id}" title="Tambah 1 terjual via QRIS">
              <span class="tally-btn-label">📱 + QRIS</span>
              <span class="tally-btn-value">${m.soldQris}</span>
            </button>
          </div>

          <!-- Micro controls: Kurangi (-), input manual, dll -->
          <div class="counter-stepper-row">
            <span style="color: var(--text-muted);">Koreksi/Manual:</span>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <!-- Cash Stepper -->
              <div class="stepper-group" title="Koreksi penjualan Cash">
                <span style="font-size: 0.72rem; color: var(--accent-cash); font-weight: 700;">C:</span>
                <button class="step-btn btn-dec-cash" data-id="${item.id}">-</button>
                <input type="number" class="step-input inp-sold-cash" data-id="${item.id}" value="${m.soldCash}" min="0">
              </div>
              <!-- QRIS Stepper -->
              <div class="stepper-group" title="Koreksi penjualan QRIS">
                <span style="font-size: 0.72rem; color: var(--accent-qris); font-weight: 700;">Q:</span>
                <button class="step-btn btn-dec-qris" data-id="${item.id}">-</button>
                <input type="number" class="step-input inp-sold-qris" data-id="${item.id}" value="${m.soldQris}" min="0">
              </div>
            </div>
          </div>
        </div>

        <!-- Sisa Riil Fisik saat Tutup Stan -->
        <div class="stock-status-row" style="background: var(--bg-card); border: 1px dashed var(--border-light);">
          <label class="checkbox-custom" title="Centang verifikasi sisa fisik di akhir penjualan">
            <input type="checkbox" class="chk-remaining" data-id="${item.id}" ${item.remainingRealChecked ? 'checked' : ''}>
            <span style="font-size: 0.75rem;">Cek Sisa Fisik:</span>
          </label>
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <input type="number" class="stock-initial-input inp-real-rem" data-id="${item.id}" 
                   placeholder="${m.remainingSystem}" value="${item.remainingReal !== null ? item.remainingReal : ''}" min="0">
            ${m.hasRemainingReal && m.stockDifference !== 0 ? `
              <span style="font-size: 0.7rem; color: ${m.stockDifference > 0 ? 'var(--accent-warn)' : 'var(--accent-danger)'}; font-weight: 700;" title="Selisih fisik dengan hitungan sistem">
                ${m.stockDifference > 0 ? `+${m.stockDifference}` : m.stockDifference}
              </span>
            ` : ''}
          </div>
        </div>

        <!-- Footer Card Subtotal -->
        <div class="card-footer-row">
          <span class="card-total-sold-text">Terjual: <strong>${m.totalSold} pcs</strong></span>
          <span class="card-subtotal-val">${formatRupiah(m.subtotal)}</span>
        </div>
      `;

      elements.cardsContainer.appendChild(card);
    });
  }

  // 2. TABLE VIEW (Detailed Spreadsheet View)
  elements.tableBody.innerHTML = '';
  if (filtered.length === 0) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          Tidak ada data barang yang sesuai.
        </td>
      </tr>
    `;
  } else {
    filtered.forEach((item, index) => {
      const m = calculateItemMetrics(item);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="color: var(--text-muted); font-size: 0.75rem;">${index + 1}</td>
        <td>
          <div style="font-weight: 700;">${item.name}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">${item.category || '-'}</div>
        </td>
        <td style="font-weight: 600;">${formatRupiah(m.price)}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <input type="checkbox" class="chk-initial" data-id="${item.id}" ${item.initialStockChecked ? 'checked' : ''}>
            <input type="number" class="table-input-number inp-stock" data-id="${item.id}" value="${m.initialStock}" min="0">
          </div>
        </td>
        <td>
          <div class="table-counter-box">
            <button class="step-btn btn-dec-cash" data-id="${item.id}">-</button>
            <input type="number" class="table-input-number inp-sold-cash" data-id="${item.id}" value="${m.soldCash}" min="0">
            <button class="step-btn btn-add-cash" data-id="${item.id}">+</button>
          </div>
        </td>
        <td>
          <div class="table-counter-box">
            <button class="step-btn btn-dec-qris" data-id="${item.id}">-</button>
            <input type="number" class="table-input-number inp-sold-qris" data-id="${item.id}" value="${m.soldQris}" min="0">
            <button class="step-btn btn-add-qris" data-id="${item.id}">+</button>
          </div>
        </td>
        <td style="font-weight: 700;">${m.totalSold}</td>
        <td>
          <span class="stock-remaining-badge ${m.remainingSystem === 0 ? 'empty' : (m.remainingSystem <= 3 ? 'low' : '')}">
            ${m.remainingSystem}
          </span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <input type="checkbox" class="chk-remaining" data-id="${item.id}" ${item.remainingRealChecked ? 'checked' : ''}>
            <input type="number" class="table-input-number inp-real-rem" data-id="${item.id}" 
                   placeholder="${m.remainingSystem}" value="${item.remainingReal !== null ? item.remainingReal : ''}" min="0">
            ${m.hasRemainingReal && m.stockDifference !== 0 ? `
              <span style="font-size: 0.7rem; color: ${m.stockDifference > 0 ? 'var(--accent-warn)' : 'var(--accent-danger)'}; font-weight: 700;">
                ${m.stockDifference > 0 ? `+${m.stockDifference}` : m.stockDifference}
              </span>
            ` : ''}
          </div>
        </td>
        <td style="font-weight: 700; color: var(--primary);">${formatRupiah(m.subtotal)}</td>
        <td>
          <button class="btn btn-outline btn-sm btn-delete-item" data-id="${item.id}" title="Hapus dari sesi ini" style="color: var(--accent-danger);">
            🗑️
          </button>
        </td>
      </tr>
    `;
      elements.tableBody.appendChild(row);
    });
  }

  attachItemEventListeners();
}

// ==========================================================================
// ITEM EVENT LISTENERS DELEGATION
// ==========================================================================
function attachItemEventListeners() {
  // Add Cash (+1)
  document.querySelectorAll('.btn-add-cash').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      store.incrementSold(id, 'cash', 1);
    };
  });

  // Dec Cash (-1)
  document.querySelectorAll('.btn-dec-cash').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      store.incrementSold(id, 'cash', -1);
    };
  });

  // Add QRIS (+1)
  document.querySelectorAll('.btn-add-qris').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      store.incrementSold(id, 'qris', 1);
    };
  });

  // Dec QRIS (-1)
  document.querySelectorAll('.btn-dec-qris').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      store.incrementSold(id, 'qris', -1);
    };
  });

  // Direct Sold Cash input
  document.querySelectorAll('.inp-sold-cash').forEach(inp => {
    inp.onchange = () => store.setSoldAmount(inp.dataset.id, 'cash', inp.value);
  });

  // Direct Sold QRIS input
  document.querySelectorAll('.inp-sold-qris').forEach(inp => {
    inp.onchange = () => store.setSoldAmount(inp.dataset.id, 'qris', inp.value);
  });

  // Initial stock input
  document.querySelectorAll('.inp-stock').forEach(inp => {
    inp.onchange = () => store.setInitialStock(inp.dataset.id, inp.value);
  });

  // Initial stock checkbox
  document.querySelectorAll('.chk-initial').forEach(chk => {
    chk.onchange = () => store.toggleInitialCheck(chk.dataset.id, chk.checked);
  });

  // Remaining real input
  document.querySelectorAll('.inp-real-rem').forEach(inp => {
    inp.onchange = () => store.setRemainingReal(inp.dataset.id, inp.value);
  });

  // Remaining real checkbox
  document.querySelectorAll('.chk-remaining').forEach(chk => {
    chk.onchange = () => store.toggleRemainingCheck(chk.dataset.id, chk.checked);
  });

  // Delete item from current session
  document.querySelectorAll('.btn-delete-item').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Hapus barang ini dari sesi jualan hari ini?')) {
        store.removeItemFromCurrentSession(btn.dataset.id);
        showToast('Barang dihapus dari sesi');
      }
    };
  });
}

// ==========================================================================
// RENDER RECONCILIATION & CLOSING VIEW (Tab 2)
// ==========================================================================
function renderReconciliation(state) {
  const { currentSession } = state;
  if (!currentSession) return;

  const summary = calculateSessionSummary(currentSession);

  // Hero Final Profit Banner (User formula: cash + qris - 150 modal)
  elements.heroFinalProfit.textContent = formatRupiah(summary.finalNetRevenueReal);

  // Card 1: Modal Awal
  if (document.activeElement !== elements.inputReconInitialCash) {
    elements.inputReconInitialCash.value = summary.initialCash;
  }

  // Card 2: Omzet Seharusnya (Sistem)
  elements.reconSysRevenue.textContent = formatRupiah(summary.totalExpectedRevenue);
  elements.reconSysCash.textContent = formatRupiah(summary.totalExpectedCash);
  elements.reconSysQris.textContent = formatRupiah(summary.totalExpectedQris);
  elements.reconSysTargetCash.textContent = formatRupiah(summary.expectedCashInHand);

  // Card 3: QRIS Riil
  if (document.activeElement !== elements.inputReconQrisReal) {
    elements.inputReconQrisReal.value = summary.manualQrisVerified || '';
  }
  elements.reconQrisSysCompare.textContent = formatRupiah(summary.totalExpectedQris);
  elements.reconQrisDiffVal.textContent = formatRupiah(Math.abs(summary.qrisDifference));

  if (summary.qrisDifference === 0) {
    elements.reconQrisStatusBadge.className = 'status-badge balanced';
    elements.reconQrisStatusBadge.innerHTML = '✅ Cocok (Rp 0)';
    elements.reconQrisDiffVal.style.color = 'var(--accent-cash)';
  } else if (summary.qrisDifference > 0) {
    elements.reconQrisStatusBadge.className = 'status-badge surplus';
    elements.reconQrisStatusBadge.innerHTML = `⚠️ Lebih ${formatRupiah(summary.qrisDifference)}`;
    elements.reconQrisDiffVal.style.color = 'var(--accent-warn)';
  } else {
    elements.reconQrisStatusBadge.className = 'status-badge deficit';
    elements.reconQrisStatusBadge.innerHTML = `❌ Kurang ${formatRupiah(Math.abs(summary.qrisDifference))}`;
    elements.reconQrisDiffVal.style.color = 'var(--accent-danger)';
  }

  // Card 4: Cash Riil
  if (document.activeElement !== elements.inputReconCashReal) {
    elements.inputReconCashReal.value = summary.manualCashInHand || '';
  }
  elements.reconCashSysTarget.textContent = formatRupiah(summary.expectedCashInHand);
  elements.reconCashDiffVal.textContent = formatRupiah(Math.abs(summary.cashDifference));

  if (summary.cashDifference === 0) {
    elements.reconCashStatusBadge.className = 'status-badge balanced';
    elements.reconCashStatusBadge.innerHTML = '✅ Cocok (Rp 0)';
    elements.reconCashDiffVal.style.color = 'var(--accent-cash)';
  } else if (summary.cashDifference > 0) {
    elements.reconCashStatusBadge.className = 'status-badge surplus';
    elements.reconCashStatusBadge.innerHTML = `⚠️ Lebih ${formatRupiah(summary.cashDifference)}`;
    elements.reconCashDiffVal.style.color = 'var(--accent-warn)';
  } else {
    elements.reconCashStatusBadge.className = 'status-badge deficit';
    elements.reconCashStatusBadge.innerHTML = `❌ Kurang ${formatRupiah(Math.abs(summary.cashDifference))}`;
    elements.reconCashDiffVal.style.color = 'var(--accent-danger)';
  }

  // Notes
  if (document.activeElement !== elements.inputReconNotes) {
    elements.inputReconNotes.value = currentSession.reconciliation?.notes || '';
  }
}

// Event listeners for reconciliation inputs
elements.inputReconInitialCash.addEventListener('input', (e) => {
  const val = parseNumber(e.target.value);
  store.updateSessionMeta({ initialCash: val });
});

elements.inputReconQrisReal.addEventListener('input', (e) => {
  const val = parseNumber(e.target.value);
  store.updateReconciliation(undefined, val, undefined);
});

elements.inputReconCashReal.addEventListener('input', (e) => {
  const val = parseNumber(e.target.value);
  store.updateReconciliation(val, undefined, undefined);
});

elements.inputReconNotes.addEventListener('input', (e) => {
  store.updateReconciliation(undefined, undefined, e.target.value);
});

// ==========================================================================
// RENDER TEMPLATES MASTER (Tab 3)
// ==========================================================================
function renderTemplates(state) {
  const { templates } = state;
  elements.templateTableBody.innerHTML = '';

  if (!templates || templates.length === 0) {
    elements.templateTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          Belum ada template barang. Klik 'Reset Menu Bawaan' untuk mengisi otomatis.
        </td>
      </tr>
    `;
    return;
  }

  templates.forEach((tpl, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="color: var(--text-muted); font-size: 0.75rem;">${index + 1}</td>
      <td><strong>${tpl.name}</strong></td>
      <td><span class="item-category-tag">${tpl.category || 'Lainnya'}</span></td>
      <td><strong>${formatRupiah(tpl.price)}</strong></td>
      <td>${tpl.defaultStock || 0} pcs</td>
      <td>
        <button class="btn btn-outline btn-sm btn-delete-tpl" data-id="${tpl.id}" style="color: var(--accent-danger);">
          🗑️ Hapus
        </button>
      </td>
    `;
    elements.templateTableBody.appendChild(row);
  });

  document.querySelectorAll('.btn-delete-tpl').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Hapus item ini dari template standar?')) {
        store.deleteTemplateItem(btn.dataset.id);
        showToast('Item dihapus dari template');
      }
    };
  });
}

elements.btnResetDefaultTemplates.addEventListener('click', () => {
  if (confirm('Kembalikan template daftar barang ke menu bawaan resmi Kantin OMK YGP?')) {
    store.resetTemplatesToDefault();
    showToast('Template dikembalikan ke menu bawaan OMK YGP');
  }
});

elements.btnAddTemplateItem.addEventListener('click', () => {
  const name = prompt('Nama makanan/minuman baru:');
  if (!name || !name.trim()) return;
  const priceStr = prompt('Harga jual satuan (Rp):', '4000');
  const price = parseNumber(priceStr);
  const category = prompt('Kategori (Makanan Gurih / Makanan Manis / Minuman Dingin / Minuman Spesial / Snack Kering):', 'Makanan Gurih');
  const stockStr = prompt('Estimasi stok default bawaan:', '20');
  const defaultStock = parseNumber(stockStr);

  store.addTemplateItem({
    name,
    price,
    category: category || 'Lainnya',
    defaultStock
  });
  showToast('Item ditambahkan ke template master!');
});

// ==========================================================================
// RENDER HISTORY (Tab 4)
// ==========================================================================
function renderHistory(state) {
  const { history } = state;
  elements.historyListContainer.innerHTML = '';

  if (!history || history.length === 0) {
    elements.historyListContainer.innerHTML = `
      <div style="padding: 3rem 1rem; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
        <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">📁</p>
        <p>Belum ada riwayat sesi penjualan yang diarsipkan.</p>
        <p style="font-size: 0.8rem; margin-top: 0.25rem;">Setelah selesai jualan hari Minggu, klik tombol "Simpan & Arsipkan Sesi" di menu Tutup Kasir.</p>
      </div>
    `;
    return;
  }

  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '0.75rem';

  history.forEach(session => {
    const sum = calculateSessionSummary(session);
    const dateStr = session.date ? new Date(session.date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) : 'Tanggal tidak tercatat';

    const card = document.createElement('div');
    card.className = 'recon-card';
    card.style.flexDirection = 'row';
    card.style.alignItems = 'center';
    card.style.justifyContent = 'space-between';
    card.style.flexWrap = 'wrap';
    card.style.gap = '0.75rem';

    card.innerHTML = `
      <div>
        <div style="font-weight: 700; font-size: 1rem;">${dateStr} • ${session.shiftName || 'Misa Minggu'}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          Petugas: <strong>${session.picName || 'Tim OMK'}</strong> | 
          Terjual: <strong>${sum.totalSoldUnits} pcs</strong> | 
          Pendapatan Bersih: <strong style="color: var(--primary);">${formatRupiah(sum.finalNetRevenueReal)}</strong>
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <button class="btn btn-outline btn-sm btn-load-archive" data-id="${session.id}">
          📂 Buka Sesi
        </button>
        <button class="btn btn-whatsapp btn-sm btn-wa-archive" data-id="${session.id}">
          📲 WA
        </button>
        <button class="btn btn-outline btn-sm btn-delete-archive" data-id="${session.id}" style="color: var(--accent-danger);">
          🗑️
        </button>
      </div>
    `;
    list.appendChild(card);
  });

  elements.historyListContainer.appendChild(list);

  // Attach history listeners
  document.querySelectorAll('.btn-load-archive').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Buka dan edit kembali sesi jualan yang diarsipkan ini? Sesi yang sedang aktif saat ini akan digantikan.')) {
        store.loadArchivedSession(btn.dataset.id);
        switchTab('cashier');
        showToast('Sesi arsip berhasil dimuat');
      }
    };
  });

  document.querySelectorAll('.btn-wa-archive').forEach(btn => {
    btn.onclick = () => {
      const sess = store.getState().history.find(h => h.id === btn.dataset.id);
      if (sess) {
        openWhatsAppModal(sess);
      }
    };
  });

  document.querySelectorAll('.btn-delete-archive').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Hapus arsip sesi penjualan ini secara permanen?')) {
        store.deleteArchivedSession(btn.dataset.id);
        showToast('Arsip berhasil dihapus');
      }
    };
  });
}

// Backup JSON
elements.btnExportBackupJson.addEventListener('click', () => {
  const fullData = store.getState();
  const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_kantin_omk_ygp_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Cadangan data berhasil diunduh! 📁');
});

// ==========================================================================
// WHATSAPP REPORT MODAL & COPY
// ==========================================================================
function openWhatsAppModal(sessionToReport = null) {
  const sess = sessionToReport || store.getState().currentSession;
  const text = generateWhatsAppReport(sess);
  elements.whatsappPreviewText.value = text;
  elements.modalWhatsappPreview.classList.add('open');
}

elements.btnQuickWa.addEventListener('click', () => openWhatsAppModal());
elements.btnCopyWaClosing.addEventListener('click', () => openWhatsAppModal());

elements.btnCopyWaModal.addEventListener('click', async () => {
  const text = elements.whatsappPreviewText.value;
  try {
    await navigator.clipboard.writeText(text);
    showToast('Laporan berhasil disalin ke Clipboard! Siap kirim ke WA! 📲');
  } catch (err) {
    elements.whatsappPreviewText.select();
    document.execCommand('copy');
    showToast('Laporan disalin! 📲');
  }
});

// ==========================================================================
// SESSION MANAGEMENT ACTIONS
// ==========================================================================
// New Session
elements.btnNewSession.addEventListener('click', () => {
  if (confirm('Mulai Sesi Jualan Baru? Data template barang akan dimuat ulang dengan stok awal baru dan modal kembalian Rp 150.000.')) {
    store.resetCurrentSession();
    showToast('Sesi jualan baru berhasil dibuat! Selamat melayani! ✨');
  }
});

// Check All Initial Stock
elements.btnCheckAllInitial.addEventListener('click', () => {
  store.checkAllInitialStock(true);
  showToast('Semua stok awal ditandai sudah diperiksa! ✅');
});

// Sync Remaining Real with System
elements.btnSyncRemaining.addEventListener('click', () => {
  store.syncAllRemainingWithSystem();
  showToast('Sisa fisik disamakan dengan hitungan sistem! 🔄');
});

// Save & Archive Session
elements.btnSaveSessionArchive.addEventListener('click', () => {
  store.archiveCurrentSession();
  showToast('Sesi jualan berhasil disimpan ke Arsip! 💾');
  switchTab('history');
});

// Print
elements.btnPrintReport.addEventListener('click', () => {
  window.print();
});

// Search input
elements.searchInput.addEventListener('input', (e) => {
  currentSearchQuery = e.target.value;
  renderItems();
});

// ==========================================================================
// MODALS LOGIC
// ==========================================================================
// Close modals
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  };
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  }
});

// Edit Session Meta Modal
elements.btnEditSessionMeta.addEventListener('click', () => {
  const { currentSession } = store.getState();
  if (!currentSession) return;
  elements.metaInputDate.value = currentSession.date || '';
  elements.metaInputShift.value = currentSession.shiftName || '';
  elements.metaInputPic.value = currentSession.picName || '';
  elements.metaInputInitialCash.value = currentSession.initialCash !== undefined ? currentSession.initialCash : 150000;
  elements.modalSessionMeta.classList.add('open');
});

elements.btnSaveSessionMeta.addEventListener('click', () => {
  store.updateSessionMeta({
    date: elements.metaInputDate.value,
    shiftName: elements.metaInputShift.value.trim() || 'Misa Minggu',
    picName: elements.metaInputPic.value.trim() || 'Tim OMK YGP',
    initialCash: parseNumber(elements.metaInputInitialCash.value)
  });
  elements.modalSessionMeta.classList.remove('open');
  showToast('Info sesi berhasil diperbarui!');
});

// Add Item to Current Session Modal
elements.btnAddItemModal.addEventListener('click', () => {
  elements.newItemName.value = '';
  elements.newItemPrice.value = '';
  elements.newItemStock.value = '';
  elements.modalAddItem.classList.add('open');
});

elements.btnConfirmAddItem.addEventListener('click', () => {
  const name = elements.newItemName.value.trim();
  if (!name) {
    alert('Nama barang wajib diisi!');
    return;
  }
  const category = elements.newItemCategory.value;
  const price = parseNumber(elements.newItemPrice.value);
  const stock = parseNumber(elements.newItemStock.value);

  store.addItemToCurrentSession({
    name,
    category,
    price,
    initialStock: stock
  });

  elements.modalAddItem.classList.remove('open');
  showToast(`"${name}" berhasil ditambahkan ke kasir! 🥐`);
});

// ==========================================================================
// TEAM SHARING & TRANSFER MODAL LOGIC
// ==========================================================================
elements.btnShareSession.addEventListener('click', () => {
  const code = store.exportSessionCode();
  const origin = window.location.origin.includes('localhost') ? window.location.origin : window.location.origin;
  const fullUrl = `${origin}${window.location.pathname}#session=${code}`;
  elements.shareLinkInput.value = fullUrl;
  elements.importCodeInput.value = '';
  elements.modalShareSession.classList.add('open');
});

elements.btnCopyShareLink.addEventListener('click', async () => {
  const url = elements.shareLinkInput.value;
  try {
    await navigator.clipboard.writeText(url);
    showToast('Link sesi berhasil disalin ke Clipboard! 🔗');
  } catch (e) {
    elements.shareLinkInput.select();
    document.execCommand('copy');
    showToast('Link sesi disalin! 🔗');
  }
});

elements.btnWaShareLink.addEventListener('click', () => {
  const url = elements.shareLinkInput.value;
  const session = store.getState().currentSession;
  const msgText = `Halo rekan OMK YGP! 🥐\nIni tautan untuk melanjutkan / memeriksa data kasir kantin (${session.shiftName || 'Misa Minggu'}):\n\n${url}`;
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msgText)}`;
  window.open(waUrl, '_blank');
});

elements.btnConfirmImportCode.addEventListener('click', () => {
  const codeOrUrl = elements.importCodeInput.value.trim();
  if (!codeOrUrl) {
    alert('Silakan tempel (paste) link atau kode sesi terlebih dahulu.');
    return;
  }
  let code = codeOrUrl;
  if (codeOrUrl.includes('#session=')) {
    code = codeOrUrl.split('#session=')[1];
  }
  const success = store.importSessionCode(code);
  if (success) {
    elements.modalShareSession.classList.remove('open');
    showToast('Data sesi berhasil diimpor dari rekan tim! 🎉');
  } else {
    alert('Format kode / tautan sesi tidak valid.');
  }
});

function checkIncomingShareHash() {
  if (window.location.hash && window.location.hash.startsWith('#session=')) {
    const code = window.location.hash.replace('#session=', '');
    if (code) {
      setTimeout(() => {
        if (confirm('📥 Ditemukan tautan sesi jualan dari rekan tim!\n\nApakah Anda ingin memuat sesi ini ke perangkat Anda?')) {
          const success = store.importSessionCode(code);
          if (success) {
            showToast('Sesi jualan berhasil dimuat dari link tim! 🎉');
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            alert('Format kode sesi tidak valid.');
          }
        }
      }, 400);
    }
  }
}

// ==========================================================================
// TAHAP 1: PERSIAPAN H-1 LISTENERS
// ==========================================================================
elements.prepInputDate.addEventListener('input', (e) => {
  store.updateSessionMeta({ date: e.target.value });
});
elements.prepInputShift.addEventListener('input', (e) => {
  store.updateSessionMeta({ shiftName: e.target.value });
});
elements.prepInputPic.addEventListener('input', (e) => {
  store.updateSessionMeta({ preparedBy: e.target.value });
});
elements.prepInputInitialCash.addEventListener('input', (e) => {
  store.updateSessionMeta({ initialCash: parseNumber(e.target.value) });
});

elements.btnPrepAddItem.addEventListener('click', () => {
  elements.btnAddItemModal.click();
});

elements.btnSavePrepCloud.addEventListener('click', async () => {
  await store.savePreparationH1({
    date: elements.prepInputDate.value,
    shiftName: elements.prepInputShift.value,
    preparedBy: elements.prepInputPic.value,
    initialCash: parseNumber(elements.prepInputInitialCash.value)
  });
  showToast('Persiapan stok disimpan ke Cloud! Siap untuk Hari-H! 📦🔥');
});

elements.btnGoToCashier.addEventListener('click', () => {
  store.activateHariH();
  switchTab('cashier');
  showToast('Mode Kasir Hari-H Aktif! Selamat melayani! ✨');
});

elements.btnViewPrepDetails.addEventListener('click', () => {
  switchTab('prep');
});

// ==========================================================================
// FIREBASE CLOUD CONFIG MODAL LISTENERS
// ==========================================================================
elements.btnCloudStatus.addEventListener('click', () => {
  const currentCfg = loadSavedFirebaseConfig();
  if (currentCfg && currentCfg.apiKey) {
    elements.fbConfigJson.value = JSON.stringify(currentCfg, null, 2);
  } else {
    elements.fbConfigJson.value = '';
  }
  const isReady = isConfigured;
  elements.fbModalStatusBadge.textContent = isReady ? '🟢 Terhubung ke Firebase' : '🟡 Belum Terhubung';
  elements.fbModalStatusBadge.style.color = isReady ? 'var(--accent-cash)' : 'var(--accent-warn)';
  elements.fbModalStatusBadge.style.background = isReady ? 'var(--accent-cash-bg)' : 'var(--accent-warn-bg)';
  elements.modalFirebaseConfig.classList.add('open');
});

elements.btnSaveFirebaseConfig.addEventListener('click', () => {
  const raw = elements.fbConfigJson.value.trim();
  if (!raw) {
    alert('Silakan tempel kode konfigurasi Firebase terlebih dahulu.');
    return;
  }
  let parsedConfig = null;
  try {
    let cleanJson = raw;
    if (cleanJson.includes('{') && cleanJson.includes('}')) {
      cleanJson = cleanJson.substring(cleanJson.indexOf('{'), cleanJson.lastIndexOf('}') + 1);
    }
    parsedConfig = JSON.parse(cleanJson);
  } catch (err) {
    try {
      const fn = new Function(`return (${raw.replace(/^(const|var|let)\s+\w+\s*=\s*/, '')})`);
      parsedConfig = fn();
    } catch (e2) {
      alert('Format konfigurasi tidak valid. Pastikan format JSON dari Firebase Console benar.');
      return;
    }
  }

  if (!parsedConfig || !parsedConfig.apiKey || !parsedConfig.projectId) {
    alert('Konfigurasi harus menyertakan "apiKey" dan "projectId".');
    return;
  }

  const result = saveFirebaseConfig(parsedConfig);
  if (result.success) {
    store.initCloudSync();
    elements.modalFirebaseConfig.classList.remove('open');
    showToast('Firebase berhasil terhubung! Sinkronisasi cloud aktif! 🔥');
  } else {
    alert('Gagal menghubungkan Firebase: ' + (result.reason || 'Periksa kembali konfigurasi Anda.'));
  }
});

// ==========================================================================
// STORE SUBSCRIPTION & APP BOOTSTRAP
// ==========================================================================
function renderApp(state) {
  renderMetaAndKpi(state);
  renderPrepView(state);
  renderItems();
  renderReconciliation(state);
  renderTemplates(state);
  renderHistory(state);
}

// Subscribe to store updates
store.subscribe(renderApp);

// Initial start
initTheme();
renderCategoryPills();
const initialState = store.getState();
setViewMode(initialState.uiSettings.viewMode || 'cards');
switchTab(initialState.uiSettings.activeTab || 'cashier');
renderApp(initialState);
checkIncomingShareHash();


