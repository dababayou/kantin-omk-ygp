/**
 * Generator Pesan WhatsApp untuk Laporan Penjualan Kantin OMK YGP
 */

import { formatRupiah, calculateItemMetrics, calculateSessionSummary } from './calculations.js';

export function generateWhatsAppReport(session) {
  const summary = calculateSessionSummary(session);
  const items = session.items || [];
  const dateFormatted = session.date ? new Date(session.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Hari Ini';

  const lines = [];

  lines.push('✨ *LAPORAN PENJUALAN KANTIN OMK YGP* ✨');
  lines.push('⛪ _Paroki St. Yohanes Gabriel Perboyre_');
  lines.push('───────────────────────');
  lines.push(`📅 *Tanggal:* ${dateFormatted}`);
  lines.push(`⏰ *Sesi/Misa:* ${session.shiftName || 'Misa Minggu'}`);
  lines.push(`👤 *Petugas:* ${session.picName || 'Tim OMK YGP'}`);
  lines.push('───────────────────────\n');

  lines.push('📋 *RINCIAN PENJUALAN ITEM:*');
  const soldItems = items.filter(item => (item.soldCash || 0) + (item.soldQris || 0) > 0);

  if (soldItems.length === 0) {
    lines.push('_(Belum ada item yang tercatat terjual)_');
  } else {
    soldItems.forEach(item => {
      const m = calculateItemMetrics(item);
      lines.push(`• *${item.name}* (${formatRupiah(item.price)})`);
      lines.push(`   Terjual: *${m.totalSold} pcs* (💵 ${m.soldCash} cash | 📱 ${m.soldQris} qris)`);
      lines.push(`   Sisa: ${m.remainingSystem} pcs | Subtotal: ${formatRupiah(m.subtotal)}`);
    });
  }

  lines.push('\n📦 *REKAP STOK:*');
  lines.push(`• Total Stok Awal: ${summary.totalInitialStock} pcs`);
  lines.push(`• Total Terjual: ${summary.totalSoldUnits} pcs`);
  lines.push(`• Total Sisa Stok: ${summary.totalRemainingStockSystem} pcs`);

  lines.push('\n💰 *REKONSILIASI KEUANGAN:*');
  lines.push(`• Modal Awal Kasir: ${formatRupiah(summary.initialCash)}`);
  lines.push(`• Omzet Seharusnya: *${formatRupiah(summary.totalExpectedRevenue)}*`);
  lines.push(`   └ Cash Seharusnya: ${formatRupiah(summary.totalExpectedCash)}`);
  lines.push(`   └ QRIS Seharusnya: ${formatRupiah(summary.totalExpectedQris)}`);
  lines.push('───────────────────────');

  lines.push('🔍 *CROSSCHECK UANG RIIL:*');
  // QRIS
  const qrisStatus = summary.qrisDifference === 0 
    ? '✅ Cocok / Klop' 
    : (summary.qrisDifference > 0 ? `⚠️ Lebih ${formatRupiah(summary.qrisDifference)}` : `❌ Kurang ${formatRupiah(Math.abs(summary.qrisDifference))}`);
  lines.push(`• QRIS Masuk (Mutasi Riil): *${formatRupiah(summary.manualQrisVerified)}*`);
  lines.push(`   Status QRIS: ${qrisStatus}`);

  // Cash
  const cashStatus = summary.cashDifference === 0 
    ? '✅ Cocok / Klop' 
    : (summary.cashDifference > 0 ? `⚠️ Lebih ${formatRupiah(summary.cashDifference)}` : `❌ Kurang ${formatRupiah(Math.abs(summary.cashDifference))}`);
  lines.push(`• Cash Fisik di Tangan: *${formatRupiah(summary.manualCashInHand)}*`);
  lines.push(`   (Target: Cash Sistem ${formatRupiah(summary.totalExpectedCash)} + Modal ${formatRupiah(summary.initialCash)})`);
  lines.push(`   Status Cash: ${cashStatus}`);

  lines.push('───────────────────────');
  lines.push('🏆 *TOTAL PENDAPATAN AKHIR (KAS BERSIH):*');
  lines.push(`Rumus: Cash (${formatRupiah(summary.manualCashInHand)}) + QRIS (${formatRupiah(summary.manualQrisVerified)}) - Modal (${formatRupiah(summary.initialCash)})`);
  lines.push(`👉 *BERSIH OMK: ${formatRupiah(summary.finalNetRevenueReal)}* 👈`);

  if (session.reconciliation?.notes?.trim()) {
    lines.push('\n📝 *Catatan Petugas:*');
    lines.push(`_${session.reconciliation.notes.trim()}_`);
  }

  lines.push('\n_Terima kasih atas pelayanan seluruh rekan-rekan OMK! Tuhan Memberkati._ 🙏');

  return lines.join('\n');
}
