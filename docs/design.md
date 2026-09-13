# Panduan UI/UX — Sistem Informasi Posyandu (Modern Clean Portal)

> **Konsep Utama:** Estetika bersih, modern, dan profesional yang diadaptasi dari gaya desain portal SaaS premium (referensi: *SalesMonk Dashboard*). Menampilkan layout dengan kontras tinggi, sudut membulat yang lembut, *card grid* yang rapi, serta representasi data visual yang intuitif untuk membantu tugas harian kader posyandu.

---

## 1. Tata Letak Halaman (Layout Grid)

Mengikuti tata letak dari gambar referensi, aplikasi ini menggunakan pembagian layar sebagai berikut:

*   **Sidebar Kiri (Navigation Panel):** Lebar tetap (fixed width), berlatar belakang putih bersih, berisi menu utama dengan ikon outline tipis dan label teks yang jelas.
*   **Top Bar (Header Navigation):** Berisi kolom pencarian melengkung (rounded), tombol notifikasi, dan profil kader (avatar foto, nama, dan email).
*   **Area Konten Utama (Main Content):** Berlatar belakang abu-abu sangat muda/off-white (`#F8F9FA`) untuk membuat kartu-kartu konten berwarna putih murni (`#FFFFFF`) terlihat menonjol dan kontras.

---

## 2. Palet Warna (Sleek & Professional)

Mengacu langsung pada referensi warna dari portal modern:

| Nama Warna | Kode HEX | Peran Utama | Deskripsi Visual |
| :--- | :--- | :--- | :--- |
| **Canvas Gray** | `#F8F9FA` | Background Halaman | Abu-abu sangat muda yang bersih sebagai dasar canvas dashboard. |
| **Pure White** | `#FFFFFF` | Latar Belakang Kartu | Putih bersih untuk semua komponen kartu (card) agar data terlihat kontras. |
| **SaaS Tosca** | `#14B8A6` | Warna Brand Utama | Warna toska cerah untuk aksi utama, menu aktif, dan kartu sorotan pertama. |
| **Charcoal Dark** | `#0B0F19` | Teks Utama | Warna hitam arang gelap pekat untuk keterbacaan judul dan data angka. |
| **Muted Gray** | `#7E8B9B` | Teks Sekunder | Abu-abu sedang untuk sub-judul, teks bantuan, dan label waktu. |
| **Trend Green** | `#10B981` (bg: `#E2F7D6`) | Indikator Sukses / Normal | Hijau mint cerah dengan latar muda untuk status normal/kenaikan positif. |
| **Trend Red** | `#EF4444` (bg: `#FEE2E2`) | Indikator Peringatan / Kurang | Merah lembut dengan latar merah muda untuk stunting/penyakit/penurunan. |

---

## 3. Tipografi & Hirarki

*   **Judul Dashboard:** 28px - Bold (`Charcoal Dark`) — Tegas dan berwibawa di kiri atas.
*   **Sub-judul Deskripsi:** 14px - Regular (`Muted Gray`) — Memberikan konteks ringkas di bawah judul.
*   **Data Angka Utama (Metrik):** 24px hingga 28px - Bold (`Charcoal Dark`) — Diletakkan di dalam summary card untuk penonjolan instan.
*   **Label Kartu:** 12px - Semi-Bold (`Muted Gray` dengan kapitalisasi / UPPERCASE) — Berfungsi sebagai penanda kategori di bagian atas kartu.

---

## 4. Komponen Visual & Spesifikasi Gaya

Setiap kartu dan elemen UI mengikuti spesifikasi taktil modern berikut:

### 4.1 Kartu Dashboard (Dashboard Cards)
*   **Latar Belakang:** `#FFFFFF` (kecuali kartu sorotan pertama menggunakan `#14B8A6`).
*   **Sudut Kelengkungan (Border Radius):** `20px` (Kelengkungan besar dan modern).
*   **Bayangan (Shadow):** Bayangan sangat halus dan lembut:
    `box-shadow: 0 4px 18px 0px rgba(0, 0, 0, 0.03)`
*   **Aksen Sudut:** Tombol bulat kecil di sudut kanan atas kartu berisi ikon panah serong kanan-atas (`ArrowUpRight` dari Lucide) sebagai navigasi detail.

### 4.2 Tombol Aksi (Buttons) & Input
*   **Pencarian (Search Input):** Input melengkung penuh (pill-shaped) berlatar belakang abu-abu terang dengan ikon pencarian `Search` dari Lucide di sebelah kiri.
*   **Tombol Filter / Export:** Berlatar belakang putih, border tipis abu-abu muda, sudut melengkung `10px`, dilengkapi ikon outline `SlidersHorizontal` / `Download`.
*   **Menu Aktif Sidebar:** Tombol dengan sudut melengkung `8px` berlatar belakang toska (`#14B8A6`) dengan teks putih murni dan ikon Lucide yang aktif.

---

## 5. Tata Letak Dashboard Posyandu (Meniru Referensi)

Berikut adalah pemetaan visual dari dashboard Posyandu berdasarkan layout *SalesMonk*:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] SIPANDU         [  Cari nama balita/lansia...       ]                 (Bell) [ Foto Kader ]     │
│                                                                                     Ibu Aminah         │
├──────────────────────┬─────────────────────────────────────────────────────────────────────────────────┤
│                      │                                                                                 │
│  (Menu)              │  Dashboard                                                   [ Export ] [ Filter ]│
│  ▣ Overview          │  Berikut ringkasan tumbuh kembang anak dan lansia bulan ini.                    │
│  □ Balita            │                                                                                 │
│  □ Lansia            │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  □ Riwayat           │  │ Total Balita   ↗│ │ Total Lansia   ↗│ │ Gizi Kurang    ↗│ │ Kehadiran      ↗││
│  □ Undangan          │  │                 │                 │                 │                 ││
│  □ Pengaturan        │  │ 48 Anak         │ │ 32 Lansia       │ │ 3 Anak          │ │ 72%             ││
│                      │  │ +3.9% vs bln lalu│ │ +4.2% vs bln lalu│ │ -2.8% vs bln lalu│ [Grafik Mini/Wave]││
│  (Bawah)             │  └(Biru Royal Card)┘ └─────────────────┘ └─────────────────┘ └─────────────────┘│
│  ? Bantuan           │                                                                                 │
│  ➔ Keluar            │  ┌──────────────────────────────────────────┐ ┌────────────────────────────────┐│
│                      │  │ Tren Status Gizi Balita (Bar Chart)      │ │ Aktivitas Kunjungan (Donut)    ││
│                      │  │                                          │ │                                ││
│                      │  │  █     █                                 │ │        ○  78%          45 Selesai│
│                      │  │  █  █  █  █  (Batang Bulat Atas)         │ │     (Semi-donut)       23 Sisa   │
│                      │  │  █  █  █  █                              │ │                        12 Tunda  │
│                      │  └──────────────────────────────────────────┘ └────────────────────────────────┘│
│                      │                                                                                 │
│                      │  ┌──────────────────────────────────────────┐ ┌────────────────────────────────┐│
│                      │  │ Kunjungan Balita Terakhir                │ │ Distribusi Wilayah (RT/RW)     ││
│                      │  │ Nama          Usia        Status         │ │ RT 01/RW 02  [===========] 72% ││
│                      │  │ Andi Pratama  12 Bulan    [ Normal ]     │ │ RT 02/RW 02  [======]     45% ││
│                      │  └──────────────────────────────────────────┘ └────────────────────────────────┘│
└──────────────────────┴─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Struktur Kode Tailwind CSS (Penerapan Tema Baru)

Konfigurasi berikut pada `tailwind.config.js` merefleksikan palet warna dan radius dari gambar referensi:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: '#F8F9FA',      // Background utama
        saas: {
          primary: '#14B8A6',   // Toska aksen
          dark: '#0B0F19',      // Teks gelap utama
          muted: '#7E8B9B',     // Teks sekunder
          lightBg: '#FFFFFF',   // Latar belakang kartu
        },
        trend: {
          successBg: '#E2F7D6',
          successText: '#10B981',
          dangerBg: '#FEE2E2',
          dangerText: '#EF4444',
        }
      },
      borderRadius: {
        'card': '20px',         // Radius kartu besar sesuai referensi
        'input': '12px',        // Radius input & tombol
      },
      boxShadow: {
        'soft-card': '0px 4px 18px 0px rgba(11, 15, 25, 0.03)',
      }
    },
  },
}
```

### Contoh Implementasi Card Balita Gizi Kurang (Metrik #3):
```html
<div class="bg-white p-6 rounded-card shadow-soft-card border border-gray-100 flex flex-col justify-between h-40 relative">
  <!-- Navigasi Detail di Sudut Kanan Atas -->
  <a href="/balita/gizi-kurang" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-saas-dark hover:bg-saas-primary hover:text-white transition-colors">
    <span class="text-sm font-semibold">↗</span>
  </a>

  <div>
    <span class="text-xs uppercase tracking-wider text-saas-muted font-semibold">Balita Gizi Kurang</span>
    <h3 class="text-3xl font-bold text-saas-dark mt-2">3 Anak</h3>
  </div>

  <div class="flex items-center gap-2 mt-4">
    <!-- Badge Status Persentase -->
    <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-trend-successBg text-trend-successText">
      -2.8%
    </span>
    <span class="text-xs text-saas-muted">vs bulan lalu</span>
  </div>
</div>
```
