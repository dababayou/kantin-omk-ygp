# Kantin OMK Paroki St. Yohanes Gabriel Perboyre (YGP)
### Sistem Digitalisasi Pencatatan Penjualan & Kasir Rekonsiliasi

Aplikasi web modern, responsif (mobile-first), dan ringan untuk menggantikan sistem pencatatan kertas manual pada stan Kantin Orang Muda Katolik (OMK) Paroki Santo Yohanes Gabriel Perboyre (YGP).

---

## 🌟 Fitur Utama & Kesesuaian Sistem

1. **Template List Barang Bawaan (Master Data)**
   - Sudah dilengkapi dengan menu camilan & minuman standar kantin gereja (Risol Mayo, Pastel, Lemper, Tahu Bakso, Donat, Roti, Aqua, Teh Pucuk, Kopi Susu OMK, dll).
   - Pengurus dapat menambah item baru, mengubah harga satuan, dan mengatur stok bawaan pada menu **⚙️ Template Barang**.

2. **Stok Awal & Crosscheck Gelar Dagangan**
   - Kolom stok awal yang dibawa / disiapkan pada saat menata produk.
   - Dilengkapi **Checklist Verifikasi Fisik** per item serta tombol *"Centang Semua Stok Awal"* untuk memastikan seluruh barang sudah dihitung sebelum buka stan.

3. **Uang Modal Awal Kembalian (Rp 150.000)**
   - Default modal awal siap kembalian **Rp 150.000** (dapat disesuaikan jika nominal berbeda pada tanggal tertentu).
   - Dipisahkan secara transparan dari laba/keuntungan bersih.

4. **Pencatatan Terjual Praktis (Counter Cepat & Tally)**
   - Tombol cepat **`[💵 + Tunai (Cash)]`** dan **`[📱 + QRIS]`** pada tiap barang. Petugas cukup 1x tap di ponsel saat melayani pembeli.
   - Stepper koreksi (+ / -) dan input angka manual untuk koreksi cepat.

5. **Sisa Stok Otomatis & Crosscheck Riil**
   - Sisa stok sistem dihitung otomatis real-time: `Stok Awal - Total Terjual`.
   - Kolom **Sisa Riil Fisik** dan tanda centang verifikasi saat tutup stan.
   - Peringatan selisih visual jika stok fisik berbeda dengan hitungan sistem (misal jika ada kue hilang atau rusak).

6. **Perhitungan Omzet Seharusnya (Sistem)**
   - Total pendapatan penjualan otomatis dihitung dari `Total (Harga Satuan × Terjual)`.
   - Rincian transparan: Total Omzet Cash vs Total Omzet QRIS.

7. **Rekonsiliasi & Crosscheck Uang Riil (Tab Tutup Kasir)**
   - **QRIS**: Perbandingan antara *QRIS Otomatis Sistem* vs *Input Total Mutasi QRIS Riil* dari m-banking. Badge status otomatis menandai `✅ Cocok / Klop`, `⚠️ Surplus`, atau `❌ Defisit`.
   - **Cash**: Perbandingan antara *Target Cash di Tangan (Omzet Cash + Modal Awal Rp 150.000)* vs *Input Total Uang Fisik di Pegang*.

8. **Perhitungan Pendapatan Total Bersih Akhir**
   - Sesuai rumus baku:
     $$\text{Total Pendapatan Bersih (Kas OMK)} = \text{Cash Fisik Riil} + \text{QRIS Riil} - 150.000 \text{ (Modal Awal)}$$
   - Ditampilkan mencolok pada Hero Banner di menu Tutup Kasir.

9. **Ekspor Laporan ke WhatsApp & Cetak PDF**
   - 1-Klik tombol **`📲 Salin Laporan WhatsApp`**: Teks laporan terformat rapi dengan emoji, rincian per barang, total stok, rekonsiliasi kas, dan kas bersih siap kirim ke grup WhatsApp pengurus OMK.
   - Tombol cetak / print untuk pembukuan fisik gereja.

10. **Riwayat Sesi & Penyimpanan Otomatis**
    - Semua data tersimpan otomatis di LocalStorage peramban (bisa diakses offline tanpa internet).
    - Tombol simpan ke arsip untuk menyimpan rekap minggu ini dan membuat sesi baru minggu depan.

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi dibuat tanpa dependensi pihak ketiga (*zero external dependencies*), sehingga sangat cepat dan dapat dijalankan dengan mudah:

### Opsi 1: Menjalankan dengan Node.js (Disarankan)
```bash
npm start
# atau
node server.js
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

### Opsi 2: Buka Langsung di Browser
Buka file `index.html` langsung dengan peramban Chrome, Edge, Safari, atau Firefox di laptop atau ponsel Anda.

---

## ☁️ Panduan Deploy ke Vercel (Gratis & Cepat)

Aplikasi ini sudah dilengkapi file konfigurasi `vercel.json` dan siap di-*deploy* langsung ke Vercel:

### Metode 1: Lewat GitHub (Sangat Disarankan)
1. Push repository ini ke akun GitHub Anda:
   ```bash
   git add .
   git commit -m "feat: digitalisasi kantin omk ygp siap deploy"
   git branch -M main
   git remote add origin https://github.com/<username-anda>/kantin-omk-ygp.git
   git push -u origin main
   ```
2. Buka dashboard [Vercel](https://vercel.com/) dan login.
3. Klik **"Add New..."** → **"Project"**.
4. Pilih repository `kantin-omk-ygp` dari GitHub Anda.
5. Biarkan semua setting default (Framework: *Other*, Root Directory: `./`).
6. Klik **"Deploy"**. Dalam hitungan detik, aplikasi aktif di URL publik (misal: `https://kantin-omk-ygp.vercel.app`)!

### Metode 2: Lewat Vercel CLI
```bash
npx vercel
```
Ikuti instruksi singkat di terminal untuk langsung mendeploy.

---

## 👥 Penggunaan Bersama Seluruh Tim OMK

Agar aplikasi dapat digunakan dengan lancar oleh seluruh tim:

1. **Jadikan Aplikasi di Layar Utama (PWA / Add to Home Screen):**
   - **Android (Chrome):** Buka link Vercel di browser HP → klik titik tiga (⋮) di pojok kanan atas → pilih **"Tambahkan ke Layar Utama" (Add to Home screen)** / **"Install App"**.
   - **iPhone (Safari):** Buka link Vercel di Safari → tap ikon Bagikan (Share) di bagian bawah → pilih **"Add to Home Screen"**.
   - Aplikasi akan tampil dengan logo resmi Kantin OMK YGP seperti aplikasi native tanpa bar URL browser!

2. **Fitur "🔗 Bagikan ke Tim" (Pergantian Shift & Transfer Data):**
   - Jika shift berganti (misal dari Misa Pagi ke Misa Sore), atau jika ketua/koordinator ingin memeriksa pembukuan di HP sendiri:
   - Petugas cukup klik tombol **`🔗 Bagikan ke Tim`** di bagian atas layar.
   - Klik **`📲 Kirim via WhatsApp`** atau **`📋 Salin Link`** dan kirimkan ke rekan tim berikutnya.
   - Saat rekan membuka link tersebut di HP mereka, aplikasi akan otomatis memuat seluruh data barang, stok, dan penjualan yang sedang berjalan!

---

## 📱 Panduan Alur Kerja Petugas Kantin Hari Minggu

1. **Persiapan (Sebelum Buka):**
   - Buka menu **Penjualan & Kasir**.
   - Periksa dan sesuaikan **Stok Awal** barang yang dibawa.
   - Centang checkbox pada barang saat menata di etalase/meja stan.
   - Pastikan modal awal kembalian Rp 150.000 sudah siap di kaleng kasir.

2. **Saat Pelayanan (Misa Selesai):**
   - Bila ada pembeli membayar tunai: Tap tombol **`+ Tunai (Cash)`**.
   - Bila pembeli scan QRIS: Tap tombol **`+ QRIS`**.
   - Sisa stok dan omzet langsung ter-update otomatis di bagian atas layar.

3. **Penutupan (Setelah Stan Selesai):**
   - Masuk ke tab **📊 Tutup Kasir & Rekonsiliasi**.
   - Masukkan total mutasi QRIS yang masuk dari m-banking di kolom **3. Verifikasi QRIS Masuk**.
   - Hitung seluruh uang kertas & koin di kaleng kasir, masukkan di kolom **4. Verifikasi Cash Fisik**.
   - Periksa badge status: pastikan keduanya bertuliskan `✅ Cocok`.
   - Periksa **Total Pendapatan Bersih Kantin OMK** yang dihasilkan rumus `Cash + QRIS - Modal`.
   - Tap **📲 Salin Laporan WhatsApp** lalu *paste* ke grup WhatsApp OMK YGP.
   - Tap **💾 Simpan & Arsipkan Sesi** untuk mengarsipkan pembukuan hari ini.

