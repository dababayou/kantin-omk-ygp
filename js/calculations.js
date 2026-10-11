/**
 * Modul Perhitungan Finansial & Rekonsiliasi Penjualan Kantin OMK YGP
 */

export function formatRupiah(amount) {
  const num = Number(amount) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

export function parseNumber(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function calculateItemMetrics(item) {
  const price = parseNumber(item.price);
  const initialStock = parseNumber(item.initialStock);
  const soldCash = parseNumber(item.soldCash);
  const soldQris = parseNumber(item.soldQris);
  const totalSold = soldCash + soldQris;
  const remainingSystem = Math.max(0, initialStock - totalSold);
  const subtotal = totalSold * price;
  const subtotalCash = soldCash * price;
  const subtotalQris = soldQris * price;

  const hasRemainingReal = item.remainingReal !== null && item.remainingReal !== undefined && item.remainingReal !== '';
  const remainingReal = hasRemainingReal ? parseNumber(item.remainingReal) : remainingSystem;
  const stockDifference = remainingReal - remainingSystem;

  return {
    price,
    initialStock,
    soldCash,
    soldQris,
    totalSold,
    remainingSystem,
    remainingReal,
    hasRemainingReal,
    stockDifference,
    subtotal,
    subtotalCash,
    subtotalQris
  };
}

export function calculateSessionSummary(session) {
  const items = session.items || [];
  const initialCash = parseNumber(session.initialCash !== undefined ? session.initialCash : 150000);
  const manualCashInHand = parseNumber(session.reconciliation?.manualCashInHand);
  const manualQrisVerified = parseNumber(session.reconciliation?.manualQrisVerified);

  let totalItemsCount = items.length;
  let totalInitialStock = 0;
  let totalSoldCash = 0;
  let totalSoldQris = 0;
  let totalSoldUnits = 0;
  let totalRemainingStockSystem = 0;
  let totalRemainingStockReal = 0;

  let initialCheckedCount = 0;
  let remainingCheckedCount = 0;

  let totalExpectedRevenue = 0;
  let totalExpectedCash = 0;
  let totalExpectedQris = 0;

  items.forEach(item => {
    const metrics = calculateItemMetrics(item);
    totalInitialStock += metrics.initialStock;
    totalSoldCash += metrics.soldCash;
    totalSoldQris += metrics.soldQris;
    totalSoldUnits += metrics.totalSold;
    totalRemainingStockSystem += metrics.remainingSystem;
    totalRemainingStockReal += metrics.remainingReal;

    if (item.initialStockChecked) initialCheckedCount++;
    if (item.remainingRealChecked) remainingCheckedCount++;

    totalExpectedRevenue += metrics.subtotal;
    totalExpectedCash += metrics.subtotalCash;
    totalExpectedQris += metrics.subtotalQris;
  });

  // Uang cash seharusnya di tangan kasir = omzet cash yang masuk + modal kembalian awal
  const expectedCashInHand = totalExpectedCash + initialCash;

  // Selisih perbandingan
  const cashDifference = manualCashInHand - expectedCashInHand;
  const qrisDifference = manualQrisVerified - totalExpectedQris;

  // Total uang riil yang terkumpul (Cash dipegang + QRIS masuk rekening)
  const totalRealReceived = manualCashInHand + manualQrisVerified;

  // Pendapatan Total Bersih Akhir sesuai rumus:
  // cash + qris - 150.000(modal)
  const finalNetRevenueReal = manualCashInHand + manualQrisVerified - initialCash;
  const finalNetRevenueExpected = totalExpectedRevenue; // Bersih sistem tanpa modal

  const totalDifference = cashDifference + qrisDifference;

  return {
    totalItemsCount,
    totalInitialStock,
    totalSoldCash,
    totalSoldQris,
    totalSoldUnits,
    totalRemainingStockSystem,
    totalRemainingStockReal,
    initialCheckedCount,
    remainingCheckedCount,
    isAllInitialChecked: totalItemsCount > 0 && initialCheckedCount === totalItemsCount,
    isAllRemainingChecked: totalItemsCount > 0 && remainingCheckedCount === totalItemsCount,
    initialCash,
    manualCashInHand,
    manualQrisVerified,
    totalExpectedRevenue,
    totalExpectedCash,
    totalExpectedQris,
    expectedCashInHand,
    cashDifference,
    qrisDifference,
    totalRealReceived,
    finalNetRevenueReal,
    finalNetRevenueExpected,
    totalDifference,
    isCashBalanced: Math.abs(cashDifference) === 0,
    isQrisBalanced: Math.abs(qrisDifference) === 0,
    isFullyBalanced: Math.abs(cashDifference) === 0 && Math.abs(qrisDifference) === 0
  };
}
