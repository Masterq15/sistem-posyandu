# 📖 BUKU PANDUAN PENGGUNA
# SIPANDU — Sistem Informasi Pelayanan dan Data Posyandu

> **Untuk:** Kader Posyandu & Masyarakat Umum  
> **Versi:** 1.0  
> **Terakhir Diperbarui:** September 2026

---

## 📋 DAFTAR ISI

1. [Apa Itu SIPANDU?](#1-apa-itu-sipandu)
2. [Cara Masuk ke Aplikasi (Login)](#2-cara-masuk-ke-aplikasi-login)
3. [Mengenal Tampilan Utama (Dashboard)](#3-mengenal-tampilan-utama-dashboard)
4. [Menu Pelayanan — Catat Pemeriksaan](#4-menu-pelayanan--catat-pemeriksaan)
5. [Menu Data Balita](#5-menu-data-balita)
6. [Menu Data Lansia](#6-menu-data-lansia)
7. [Menu Riwayat Pemeriksaan](#7-menu-riwayat-pemeriksaan)
8. [Menu Laporan](#8-menu-laporan)
9. [Menu Pengaturan Akun](#9-menu-pengaturan-akun)
10. [Portal Publik (Untuk Masyarakat)](#10-portal-publik-untuk-masyarakat)
11. [Pertanyaan yang Sering Ditanyakan (FAQ)](#11-pertanyaan-yang-sering-ditanyakan-faq)
12. [Panduan Singkat Kode Status Gizi](#12-panduan-singkat-kode-status-gizi)

---

## 1. Apa Itu SIPANDU?

**SIPANDU** (Sistem Informasi Pelayanan dan Data Posyandu) adalah aplikasi digital berbasis web yang membantu kader posyandu mencatat, memantau, dan melaporkan data kesehatan balita dan lansia secara mudah dan terorganisir.

### ✅ Apa yang bisa dilakukan di SIPANDU?

| Fitur | Keterangan |
|-------|------------|
| 📊 **Dashboard** | Lihat ringkasan data posyandu secara real-time |
| 💉 **Pelayanan** | Catat pemeriksaan balita dan lansia saat posyandu berlangsung |
| 👶 **Data Balita** | Kelola data lengkap balita terdaftar |
| 👴 **Data Lansia** | Kelola data lengkap lansia terdaftar |
| 📋 **Riwayat** | Lihat histori pemeriksaan sebelumnya |
| 📄 **Laporan** | Unduh laporan bulanan dalam format PDF atau Excel |
| 🌐 **Portal Publik** | Masyarakat bisa melihat data rekapitulasi tanpa perlu login |

---

## 2. Cara Masuk ke Aplikasi (Login)

### Langkah-langkah Login:

**Langkah 1 — Buka Aplikasi**

Ketik alamat aplikasi di browser (Chrome, Firefox, dll):

```
https://sistem-posyandu.vercel.app
```

> 💡 **Tips:** Simpan alamat ini sebagai Bookmark agar mudah ditemukan lagi.

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Halaman Login — Tampilan awal saat membuka aplikasi]**
>
> ![Login Page](./screenshots/01-halaman-login.png)
>
> *Letakkan screenshot halaman login di sini. Tampilan berisi form email, password, dan tombol "Masuk".*

---

**Langkah 2 — Masukkan Email dan Password**

1. Klik kolom **Email**, ketik email Anda yang sudah didaftarkan
2. Klik kolom **Password**, ketik kata sandi Anda
3. Klik tombol **"Masuk"**

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Form Login diisi — Email dan password sudah diketik, siap klik Masuk]**
>
> ![Login Form Filled](./screenshots/02-login-form-diisi.png)
>
> *Tampilkan form dengan email dan password terisi (password disensor/bintang).*

---

**Langkah 3 — Login dengan Google (Alternatif)**

Jika Anda memiliki akun Google, Anda bisa klik tombol **"Masuk dengan Google"** — lebih cepat, tidak perlu ingat password.

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Tombol Login dengan Google]**
>
> ![Google Login](./screenshots/03-login-google.png)
>
> *Tampilkan tombol "Masuk dengan Google" di halaman login.*

---

**Langkah 4 — Berhasil Login**

Setelah berhasil login, Anda akan langsung masuk ke halaman **Dashboard** aplikasi.

> ⚠️ **Jika lupa password:** Klik tautan **"Lupa Password?"** di halaman login. Anda akan menerima email untuk membuat password baru.

---

## 3. Mengenal Tampilan Utama (Dashboard)

Setelah login, Anda akan melihat halaman **Dashboard** — pusat kontrol posyandu Anda.

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Halaman Dashboard — Tampilan penuh]**
>
> ![Dashboard](./screenshots/04-dashboard-overview.png)
>
> *Tampilkan seluruh halaman dashboard termasuk menu samping, kartu KPI, dan grafik.*

---

### Bagian-bagian Dashboard:

#### 🔢 A. Kartu Statistik (KPI)

Di bagian atas terdapat **4 kartu angka** yang menunjukkan kondisi posyandu bulan ini:

| Kartu | Artinya |
|-------|---------|
| 👶 **Total Balita** | Jumlah balita yang terdaftar |
| 👴 **Total Lansia** | Jumlah lansia yang terdaftar |
| ✅ **Hadir Bulan Ini** | Berapa yang sudah diperiksa |
| ⚠️ **Perlu Perhatian** | Balita/lansia dengan kondisi yang perlu ditindaklanjuti |

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Kartu KPI — 4 kartu statistik di bagian atas dashboard]**
>
> ![KPI Cards](./screenshots/05-dashboard-kpi-cards.png)
>
> *Tampilkan 4 kartu statistik dengan angka-angkanya.*

---

#### 📊 B. Grafik Tren Gizi

Grafik batang/garis yang menunjukkan perkembangan status gizi balita dari bulan ke bulan.

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Grafik Tren Gizi di Dashboard]**
>
> ![Tren Gizi Chart](./screenshots/06-dashboard-grafik-tren.png)
>
> *Tampilkan grafik tren gizi bulanan.*

---

#### 📋 C. Tabel Kunjungan Terbaru

Daftar balita dan lansia yang terakhir diperiksa.

#### 🗺️ D. Distribusi Kehadiran RT/RW

Menampilkan persentase kehadiran warga berdasarkan wilayah RT/RW.

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Tabel kunjungan dan distribusi RT/RW]**
>
> ![Visits Table](./screenshots/07-dashboard-tabel-kunjungan.png)
>
> *Tampilkan tabel kunjungan terbaru dan distribusi per RT/RW.*

---

#### 🔘 E. Tombol Aksi di Header Dashboard

Di pojok kanan atas terdapat dua tombol:

- **"Pemeriksaan Cepat"** → Langsung menuju halaman Pelayanan untuk mencatat pemeriksaan
- **"Laporan"** → Langsung menuju halaman Laporan untuk mengunduh/mencetak laporan

---

## 4. Menu Pelayanan — Catat Pemeriksaan

Menu **Pelayanan** digunakan saat posyandu sedang berlangsung untuk mencatat pemeriksaan satu per satu.

### Cara Membuka Menu Pelayanan:

Klik menu **"Pelayanan"** di bilah navigasi sebelah kiri.

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Menu Pelayanan — Tampilan halaman utama pelayanan]**
>
> ![Pelayanan](./screenshots/08-menu-pelayanan.png)
>
> *Tampilkan halaman pelayanan dengan antrian dan tombol tambah.*

---

### A. Memulai Sesi Posyandu (Periode Aktif)

Sebelum mencatat, pastikan **Periode Aktif** sudah dipilih. Periode adalah bulan dan tahun posyandu berlangsung.

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Banner Periode Aktif di halaman Pelayanan]**
>
> ![Periode Banner](./screenshots/09-periode-aktif.png)
>
> *Tampilkan banner periode aktif di bagian atas halaman pelayanan.*

---

### B. Menambah Peserta ke Antrian

1. Klik tombol **"+ Tambah Balita"** atau **"+ Tambah Lansia"**
2. Cari nama peserta di kolom pencarian
3. Klik nama yang sesuai → peserta masuk ke daftar antrian

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Modal pencarian dan tambah peserta ke antrian]**
>
> ![Tambah Peserta](./screenshots/10-tambah-peserta-antrian.png)
>
> *Tampilkan modal pencarian peserta.*

---

### C. Mencatat Hasil Pemeriksaan Balita

1. Dari daftar antrian, klik tombol **"Periksa"** di samping nama balita
2. Isi formulir pemeriksaan:

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Formulir Pemeriksaan Balita — Form lengkap]**
>
> ![Form Periksa Balita](./screenshots/11-form-periksa-balita.png)
>
> *Tampilkan form pemeriksaan balita dengan semua kolom input.*

---

| Kolom | Keterangan | Contoh |
|-------|-----------|--------|
| **Tanggal Periksa** | Tanggal pemeriksaan hari ini | 19/09/2026 |
| **Berat Badan (BB)** | Diisi dalam satuan kg | 8.5 |
| **Tinggi Badan (TB)** | Diisi dalam satuan cm | 75 |
| **Lingkar Kepala (LK)** | Opsional, dalam cm | 44 |
| **LiLA** | Lingkar lengan atas, dalam cm | 14 |
| **Vitamin A** | Centang jika diberikan | ✓ |
| **ASI Eksklusif** | Centang jika masih ASI | ✓ |
| **Obat Cacing** | Centang jika diberikan | ✓ |
| **Status Imunisasi** | Pilih dari daftar | Lengkap |

3. Status gizi **(BB/U, TB/U, BB/TB)** akan **otomatis dihitung** setelah BB dan TB diisi.
4. Klik **"Simpan Pemeriksaan"**

> ✅ **Muncul notifikasi hijau** = Data berhasil tersimpan!

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Status gizi otomatis terkalkulasi setelah isi BB/TB]**
>
> ![Auto Kalkulasi Status Gizi](./screenshots/12-auto-kalkulasi-gizi.png)
>
> *Tampilkan badge status BB/U, TB/U, BB/TB yang muncul otomatis.*

---

### D. Mencatat Hasil Pemeriksaan Lansia

1. Dari daftar antrian, klik **"Periksa"** di samping nama lansia
2. Isi formulir pemeriksaan lansia:

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Formulir Pemeriksaan Lansia]**
>
> ![Form Periksa Lansia](./screenshots/13-form-periksa-lansia.png)
>
> *Tampilkan form pemeriksaan lansia.*

---

| Kolom | Keterangan | Contoh |
|-------|-----------|--------|
| **Berat Badan (BB)** | Dalam kg | 60 |
| **Tinggi Badan (TB)** | Dalam cm | 155 |
| **Tekanan Darah** | Sistol/Diastol dalam mmHg | 120/80 |
| **GDS** | Gula Darah Sewaktu, mg/dL | 110 |
| **Kolesterol** | Dalam mg/dL (opsional) | 180 |
| **Asam Urat** | Dalam mg/dL (opsional) | 5.5 |
| **Lingkar Perut** | Dalam cm | 88 |
| **Keluhan** | Tulis keluhan yang disampaikan | Pusing |
| **Tindakan** | Tulis tindakan yang diberikan | Edukasi diet |

3. Klik **"Simpan Pemeriksaan"**

---

## 5. Menu Data Balita

Menu **Data Balita** digunakan untuk mendaftarkan balita baru dan melihat/mengelola data balita yang sudah terdaftar.

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Halaman Daftar Balita — Tabel lengkap data balita]**
>
> ![Data Balita](./screenshots/14-menu-data-balita.png)
>
> *Tampilkan tabel daftar balita dengan kolom nama, usia, status gizi, dan aksi.*

---

### A. Mendaftarkan Balita Baru

1. Klik tombol **"+ Tambah Balita"** (pojok kanan atas)
2. Isi formulir data balita:

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Form Tambah Balita Baru]**
>
> ![Form Tambah Balita](./screenshots/15-form-tambah-balita.png)
>
> *Tampilkan form pendaftaran balita baru.*

---

| Kolom | Keterangan |
|-------|-----------|
| **Nama Lengkap** | Nama balita sesuai KK |
| **NIK** | Nomor Induk Kependudukan (jika ada) |
| **Tanggal Lahir** | Format: Hari/Bulan/Tahun |
| **Jenis Kelamin** | Laki-laki / Perempuan |
| **Nama Ibu** | Nama ibu kandung |
| **RT/RW** | Contoh: 001/002 |
| **Posyandu** | Sudah otomatis terisi |

3. Klik **"Simpan"**

### B. Melihat Detail Balita

Klik nama balita di tabel → akan muncul halaman detail lengkap berisi:
- Data pribadi balita
- Grafik pertumbuhan BB dan TB dari waktu ke waktu
- Riwayat pemeriksaan semua bulan

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Halaman Detail Balita — Grafik pertumbuhan dan riwayat]**
>
> ![Detail Balita](./screenshots/16-detail-balita.png)
>
> *Tampilkan halaman detail balita dengan grafik dan tabel riwayat.*

---

### C. Mencari Balita

Ketik nama balita di kolom **🔍 Cari** di bagian atas tabel — hasil langsung muncul tanpa perlu klik tombol apapun.

---

## 6. Menu Data Lansia

Sama seperti menu Balita, menu **Data Lansia** digunakan untuk mendaftarkan dan mengelola data lansia.

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Halaman Daftar Lansia]**
>
> ![Data Lansia](./screenshots/17-menu-data-lansia.png)
>
> *Tampilkan tabel daftar lansia.*

---

### Mendaftarkan Lansia Baru

1. Klik **"+ Tambah Lansia"**
2. Isi formulir:

| Kolom | Keterangan |
|-------|-----------|
| **Nama Lengkap** | Nama sesuai KTP |
| **NIK** | Nomor KTP |
| **Tanggal Lahir** | Format: Hari/Bulan/Tahun |
| **Jenis Kelamin** | Laki-laki / Perempuan |
| **RT/RW** | Wilayah tempat tinggal |
| **Riwayat HT** | Centang jika punya riwayat Hipertensi |
| **Riwayat DM** | Centang jika punya riwayat Diabetes |

3. Klik **"Simpan"**

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Form Tambah Lansia Baru]**
>
> ![Form Tambah Lansia](./screenshots/18-form-tambah-lansia.png)
>
> *Tampilkan form pendaftaran lansia.*

---

## 7. Menu Riwayat Pemeriksaan

Menu **Riwayat** menampilkan semua catatan pemeriksaan yang pernah dilakukan, bisa difilter berdasarkan:
- Bulan dan tahun
- Jenis (Balita / Lansia)
- Nama peserta
- Status gizi

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Halaman Riwayat Pemeriksaan — Tabel dengan filter]**
>
> ![Riwayat](./screenshots/19-menu-riwayat.png)
>
> *Tampilkan halaman riwayat dengan filter aktif dan tabel data.*

---

### Cara Menggunakan Filter:

1. Pilih **Bulan** dan **Tahun** dari dropdown
2. Pilih **Kategori**: Semua / Balita / Lansia
3. Ketik nama di **kolom pencarian** untuk mempersempit hasil
4. Data otomatis diperbarui sesuai filter

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Filter riwayat dipilih dan tabel menampilkan hasil]**
>
> ![Riwayat Filter](./screenshots/20-riwayat-filter.png)
>
> *Tampilkan filter yang sudah dipilih dan hasil filternya di tabel.*

---

### Melihat Detail Pemeriksaan

Klik baris/nama di tabel → muncul modal detail berisi semua data pemeriksaan saat itu.

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Modal Detail Riwayat Pemeriksaan]**
>
> ![Detail Riwayat](./screenshots/21-detail-riwayat.png)
>
> *Tampilkan modal detail riwayat pemeriksaan.*

---

## 8. Menu Laporan

Menu **Laporan** menghasilkan laporan resmi bulanan yang bisa dicetak atau diunduh.

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Halaman Laporan — Tampilan lengkap dengan rekapan statistik]**
>
> ![Laporan](./screenshots/22-menu-laporan.png)
>
> *Tampilkan halaman laporan dengan kartu rekapan dan tabel data.*

---

### A. Mengatur Filter Laporan

1. Pilih **Kategori**: Balita atau Lansia
2. Pilih **Bulan** dan **Tahun** laporan yang diinginkan
3. Pilih **Posyandu** (jika ada lebih dari satu)

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Filter Card di halaman Laporan]**
>
> ![Laporan Filter](./screenshots/23-laporan-filter.png)
>
> *Tampilkan komponen filter card dengan pilihan kategori, bulan, tahun.*

---

### B. Membaca Rekapan Statistik

Di bagian atas terdapat **kartu ringkasan** yang menampilkan:

**Untuk Balita:**
- Total anak diperiksa
- Jumlah bergizi Normal / Kurang / Lebih / Obesitas
- Jumlah stunting (TB/U pendek dan sangat pendek)
- Pemberian Vitamin A, ASI Eksklusif, Obat Cacing

**Untuk Lansia:**
- Total lansia diperiksa
- Kasus Hipertensi / Diabetes
- Status tekanan darah

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Kartu Rekapan Statistik Balita di Laporan]**
>
> ![Rekapan Balita](./screenshots/24-rekapan-balita.png)
>
> *Tampilkan kartu rekapan statistik balita.*

---

### C. Mengunduh Laporan Excel

1. Klik tombol **"Unduh Excel"**
2. File `.xlsx` akan otomatis terunduh
3. Buka dengan Microsoft Excel atau Google Sheets

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Tombol Unduh Excel di halaman Laporan]**
>
> ![Unduh Excel](./screenshots/25-unduh-excel.png)
>
> *Tampilkan tombol "Unduh Excel" dan progress saat mengunduh.*

---

### D. Pratinjau & Cetak PDF

1. Klik tombol **"Pratinjau PDF"** atau **"Cetak"**
2. Muncul jendela pratinjau dokumen
3. Klik **"Unduh PDF"** atau **"Cetak (Print)"**

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Modal Pratinjau Laporan PDF]**
>
> ![Preview PDF](./screenshots/26-pratinjau-pdf.png)
>
> *Tampilkan modal pratinjau laporan dengan tombol cetak dan unduh.*

---

## 9. Menu Pengaturan Akun

### A. Mengubah Data Profil

1. Klik menu **"Pengaturan"** di bilah navigasi kiri
2. Ubah **Nama**, **Foto Profil**, atau informasi lainnya
3. Klik **"Simpan Perubahan"**

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Halaman Pengaturan Akun]**
>
> ![Pengaturan](./screenshots/27-pengaturan-akun.png)
>
> *Tampilkan halaman pengaturan profil kader.*

---

### B. Mengubah Password

1. Di halaman Pengaturan, cari bagian **"Keamanan"**
2. Isi **Password Lama**, **Password Baru**, dan **Konfirmasi Password Baru**
3. Klik **"Ubah Password"**

### C. Keluar dari Aplikasi (Logout)

Klik **foto profil / nama** di pojok kiri bawah → pilih **"Keluar"**.

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Tombol Logout di menu profil]**
>
> ![Logout](./screenshots/28-logout.png)
>
> *Tampilkan menu profil dengan opsi Keluar.*

---

## 10. Portal Publik (Untuk Masyarakat)

Portal Publik adalah halaman yang bisa diakses **tanpa login** oleh siapa saja — orang tua, wali, atau masyarakat umum yang ingin melihat data rekapitulasi posyandu.

### Cara Mengakses:

Buka browser dan ketik:

```
https://sistem-posyandu.vercel.app/puskesmas
```

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Halaman Portal Publik — Tampilan awal]**
>
> ![Portal Publik](./screenshots/29-portal-publik.png)
>
> *Tampilkan halaman portal publik dengan header SIPANDU dan filter data.*

---

### Fitur yang Tersedia di Portal Publik:

#### 🔍 Filter Data

Masyarakat dapat memfilter data berdasarkan:
- **Kategori**: Balita atau Lansia
- **Posyandu**: Pilih posyandu tertentu atau semua
- **Bulan & Tahun**: Pilih periode yang diinginkan

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Filter Portal Publik dipilih]**
>
> ![Filter Publik](./screenshots/30-portal-publik-filter.png)
>
> *Tampilkan filter portal publik dengan pilihan kategori dan periode.*

---

#### 📊 Tabel Data Rekapitulasi

Menampilkan daftar seluruh pemeriksaan sesuai filter yang dipilih.

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Tabel Data Balita di Portal Publik]**
>
> ![Tabel Publik Balita](./screenshots/31-portal-publik-tabel-balita.png)
>
> *Tampilkan tabel data balita di portal publik.*

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Tabel Data Lansia di Portal Publik]**
>
> ![Tabel Publik Lansia](./screenshots/32-portal-publik-tabel-lansia.png)
>
> *Tampilkan tabel data lansia di portal publik.*

---

#### 📄 Pratinjau & Unduh Laporan Publik

1. Klik tombol **"Pratinjau Laporan"**
2. Dokumen laporan akan muncul lengkap dengan kop SIPANDU
3. Klik **"Unduh Excel"** atau **"Unduh PDF"**

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Modal Pratinjau Laporan di Portal Publik]**
>
> ![Preview Publik](./screenshots/33-portal-publik-preview.png)
>
> *Tampilkan modal pratinjau laporan publik dengan kop SIPANDU.*

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Hasil file Excel yang diunduh dari portal publik — terbuka di spreadsheet]**
>
> ![Excel Downloaded](./screenshots/34-excel-publik-hasil.png)
>
> *Tampilkan contoh file Excel yang sudah terunduh dan dibuka di aplikasi spreadsheet.*

---

#### 🔎 Melihat Detail Peserta

Klik nama di tabel → muncul modal detail yang menampilkan:
- Data pribadi peserta
- Grafik pertumbuhan BB/TB dari waktu ke waktu
- Semua riwayat pemeriksaan yang pernah dicatat

---

<!-- SCREENSHOT PLACEHOLDER -->
> 📸 **[Screenshot: Modal Detail Peserta di Portal Publik — Grafik tren pertumbuhan]**
>
> ![Detail Peserta Publik](./screenshots/35-portal-publik-detail-peserta.png)
>
> *Tampilkan modal detail peserta dengan grafik dan riwayat lengkap.*

---

## 11. Pertanyaan yang Sering Ditanyakan (FAQ)

### ❓ Lupa password, bagaimana?
Klik **"Lupa Password?"** di halaman login → masukkan email → cek email untuk tautan reset password.

### ❓ Data yang saya simpan tidak muncul, kenapa?
Coba **refresh halaman** (tekan F5 atau tarik ke bawah di HP). Jika masih tidak muncul, cek koneksi internet.

### ❓ Bisakah satu HP dipakai oleh beberapa kader?
Bisa, selama setiap kader **Logout** sebelum kader lain masuk dengan akunnya masing-masing.

### ❓ Apakah data aman?
Ya. Data disimpan di server yang aman dan hanya bisa diakses oleh pengguna yang memiliki akun yang sah. Portal publik hanya menampilkan data rekapitulasi, bukan data pribadi yang sensitif.

### ❓ Apakah bisa diakses dari HP?
Ya, SIPANDU bisa diakses dari **HP, tablet, maupun laptop** selama ada browser dan koneksi internet.

### ❓ Kalau sinyal jelek, apakah data hilang?
Saat sinyal lemah, coba kembali ke halaman dan simpan ulang. SIPANDU menyimpan **cache sementara** untuk membantu memuat data lebih cepat.

### ❓ Siapa yang bisa mendaftarkan balita/lansia baru?
Hanya **kader posyandu yang sudah login** yang bisa mendaftarkan peserta baru. Masyarakat umum hanya bisa melihat data di Portal Publik.

---

## 12. Panduan Singkat Kode Status Gizi

### Status Berat Badan menurut Umur (BB/U):

| Kode | Artinya | Warna |
|------|---------|-------|
| **SK** | Sangat Kurang | 🔴 Merah |
| **K** | Kurang | 🟠 Oranye |
| **N** | Normal | 🟢 Hijau |
| **L** | Lebih | 🟡 Kuning |

### Status Tinggi Badan menurut Umur (TB/U):

| Kode | Artinya | Warna |
|------|---------|-------|
| **SP** | Sangat Pendek (Stunting Berat) | 🔴 Merah |
| **P** | Pendek (Stunting) | 🟠 Oranye |
| **N** | Normal | 🟢 Hijau |
| **T** | Tinggi | 🟡 Kuning |

### Status Berat Badan menurut Tinggi Badan (BB/TB):

| Kode | Artinya | Warna |
|------|---------|-------|
| **SK** | Sangat Kurus | 🔴 Merah |
| **K** | Kurus | 🟠 Oranye |
| **N** | Normal | 🟢 Hijau |
| **G** | Gemuk | 🟡 Kuning |
| **O** | Obesitas | 🟣 Ungu |

### Tekanan Darah Lansia:

| Kondisi | Nilai Sistol/Diastol |
|---------|---------------------|
| ✅ Normal | < 130/85 mmHg |
| ⚠️ Pra-Hipertensi | 130–139 / 85–89 mmHg |
| 🔴 Hipertensi | ≥ 140 / ≥ 90 mmHg |

### Gula Darah Sewaktu (GDS):

| Kondisi | Nilai |
|---------|-------|
| ✅ Normal | < 140 mg/dL |
| ⚠️ Pra-Diabetes | 140–199 mg/dL |
| 🔴 Diabetes (Perlu Rujuk) | ≥ 200 mg/dL |

---

## 📞 Butuh Bantuan?

Jika mengalami kendala teknis yang tidak tercantum di panduan ini, hubungi:

- 📧 **Email Tim SIPANDU:** support@sipandu.app
- 💬 **Grup WhatsApp Kader:** *(tanyakan nomor grup ke koordinator posyandu Anda)*
- 📋 **Menu Bantuan di Aplikasi:** Klik menu **"Bantuan"** di navigasi kiri aplikasi

---

*Panduan ini akan terus diperbarui seiring perkembangan aplikasi SIPANDU.*

**© 2026 SIPANDU — Sistem Informasi Pelayanan dan Data Posyandu**
