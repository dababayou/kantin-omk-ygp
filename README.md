# Kantin OMK Paroki St. Yohanes Gabriel Perboyre (YGP)
### Sistem Digitalisasi Pencatatan Penjualan & Kasir Rekonsiliasi

Aplikasi web modern, responsif (mobile-first), dan ringan untuk menggantikan sistem pencatatan kertas manual pada stan Kantin Orang Muda Katolik (OMK) Paroki Santo Yohanes Gabriel Perboyre (YGP)

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

## 👥 Alur Kerja 2 Tahap (H-1 Persiapan & Hari-H Kasir)

Aplikasi telah dirancang memisahkan 2 tanggung jawab agar tidak saling tumpang tindih:

### 📦 Tahap 1: Persiapan Menu & Stok Awal (H-1 / Sebelum Misa)
* **Petugas:** Tim Logistik / Konsumsi OMK (yang belanja atau menerima kue titipan).
* **Langkah:**
  1. Buka tab **`📦 1. Persiapan (H-1)`**.
  2. Tentukan Tanggal Misa, nama yang menyiapkan, dan pastikan modal awal (Rp 150.000).
  3. Masukkan jumlah **Stok Awal yang Disiapkan** untuk tiap kue/minuman.
  4. Klik **`💾 Simpan Persiapan ke Cloud (Siap untuk Hari-H)`**.
  5. Selesai! Data stok awal otomatis tersimpan aman di Cloud Firestore.

### 🛍️ Tahap 2: Operasional Kasir & Penjualan (Hari-H Saat Misa)
* **Petugas:** Rekan-rekan OMK yang bertugas jaga stand kantin di gereja.
* **Langkah:**
  1. Buka tab **`🛍️ 2. Kasir (Hari-H)`** di HP masing-masing.
  2. Muncul banner: *"Stok Awal Telah Disiapkan oleh Tim Logistik"*.
  3. Saat menata kue di meja stand, petugas tinggal mencentang kotak verifikasi fisik.
  4. Saat melayani pembeli, cukup tap tombol cepat **`[💵 + Tunai (Cash)]`** atau **`[📱 + QRIS]`**.
  5. Data penjualan dan sisa stok tersinkronisasi otomatis secara realtime antar-HP!

### 📊 Tahap 3: Tutup Kasir & Rekonsiliasi
1. Masuk ke tab **`📊 3. Tutup & Rekonsiliasi`**.
2. Masukkan mutasi QRIS riil dari m-banking dan hitung uang tunai di kaleng kasir.
3. Evaluasi selisih (pastikan status bertuliskan `✅ Cocok`).
4. Dapatkan **Total Pendapatan Bersih** sesuai rumus: `Cash + QRIS - Modal Awal Rp 150.000`.
5. Tap **`📲 Salin Laporan WhatsApp`** dan kirim ke grup WA pengurus OMK.

---

## 🔥 Cara Menghubungkan Firebase Firestore (100% Gratis Google)

Agar seluruh HP petugas otomatis tersinkronisasi secara realtime tanpa kirim-kirim link manual:

1. Buka [console.firebase.google.com](https://console.firebase.google.com) dan login dengan akun Google Anda.
2. Klik **"Add Project"** (Beri nama misal: `kantin-omk-ygp`).
3. Pada menu sebelah kiri, pilih **Build** ➔ **Firestore Database** ➔ Klik **Create Database** (Pilih mode **Test mode** agar langsung bisa dibaca/tulis).
4. Di halaman Project Overview, klik ikon Web **`</>`** untuk membuat web app.
5. Salin objek `firebaseConfig` yang muncul. Contohnya:
   ```javascript
   {
     apiKey: "AIzaSy...",
     authDomain: "kantin-omk-ygp.firebaseapp.com",
     projectId: "kantin-omk-ygp",
     storageBucket: "kantin-omk-ygp.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   }
   ```
6. Buka web aplikasi Kantin OMK YGP di browser Anda, klik tombol **`Mode Lokal (Hubungkan)`** di pojok kanan atas, lalu tempel kode tersebut dan klik **"Simpan & Sambungkan Firebase"**.
7. Status akan berubah menjadi **`🟢 Cloud Terhubung 🔥`** dan semua HP tim akan otomatis tersinkronisasi realtime!


