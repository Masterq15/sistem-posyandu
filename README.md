# 🏥 SIPANDU - Sistem Informasi Pelayanan dan Data Posyandu

> Platform digital pencatatan tumbuh kembang balita & pelayanan kesehatan lansia untuk Posyandu Indonesia.

![SIPANDU](https://img.shields.io/badge/status-development-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Express](https://img.shields.io/badge/Express-5-green?style=flat-square&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Arsitektur](#-arsitektur)
- [Tech Stack](#-tech-stack)
- [Struktur Proyek](#-struktur-proyek)
- [Cara Menjalankan](#-cara-menjalankan)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables)
- [Alur Penggunaan](#-alur-penggunaan)
- [Kontribusi](#-kontribusi)

---

## 🌟 Tentang Proyek

**SIPANDU** (Sistem Informasi Pelayanan dan Data Posyandu) adalah sistem informasi berbasis web yang dirancang untuk membantu kader posyandu dalam:

- Mencatat **tumbuh kembang balita** (berat badan, tinggi badan, lingkar kepala, status gizi)
- Memantau **kesehatan lansia** (tekanan darah, gula darah, berat badan, lingkar perut)
- Melihat **ringkasan dashboard** statistik posyandu secara real-time
- Mengelola **data kader** dan posyandu secara digital

Sistem ini menggantikan pencatatan manual di buku register posyandu dengan solusi digital yang akurat, mudah digunakan, dan dapat diakses kapan saja.

---

## ✨ Fitur Utama

### 🔐 Autentikasi & Multi-tenant
- **Daftar Posyandu Baru** — kader mendaftarkan posyandu sekaligus membuat akun pengelola (OWNER) dalam 2 langkah mudah
- **Login** berbasis JWT dengan auto-verify via `/api/auth/me`
- **Isolasi data per posyandu** — setiap posyandu hanya dapat mengakses datanya sendiri
- Peran kader: `OWNER` (pengelola penuh) dan `KADER` (anggota)

### 📊 Dashboard
- Total balita & lansia terdaftar (live dari database)
- Ringkasan status gizi balita (BB/U, TB/U, BB/TB)
- Statistik Hipertensi & Diabetes Mellitus lansia
- Tabel 10 pemeriksaan terbaru (balita & lansia)
- Catat pemeriksaan cepat langsung dari dashboard

### 👶 Manajemen Balita
- Daftar balita dengan pencarian nama, NIK, atau nama ibu
- Filter berdasarkan kelompok usia (0–6, 7–12, 13–24, 25–60 bulan)
- Detail profil balita + riwayat pemeriksaan lengkap
- Tambah pemeriksaan baru dengan validasi real-time (peringatan BB/TB tidak wajar)
- Input status gizi: BB/U, TB/U, BB/TB dan pemberian Vitamin A

### 👴 Manajemen Lansia
- Daftar lansia dengan pencarian & filter kelompok umur (Pra-lansia, 60–69, ≥70 tahun)
- Filter berdasarkan riwayat Hipertensi / Diabetes
- Riwayat pemeriksaan: tekanan darah, gula darah sewaktu, lingkar perut
- Peringatan otomatis untuk nilai tekanan darah / GDS yang ekstrem

### 📋 Lainnya
- Modul pelayanan untuk kunjungan harian
- Riwayat pemeriksaan historis
- Manajemen akun kader
- Pengaturan posyandu & bantuan

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  Next.js 16 · TypeScript · TailwindCSS · Lucide Icons       │
│                                                             │
│  src/                                                       │
│  ├── app/          → Pages (login/register, main app)       │
│  ├── contexts/     → AuthContext (JWT management)           │
│  ├── lib/api.ts    → Typed API client (fetch wrapper)       │
│  └── features/     → Dashboard, Balita, Lansia modules      │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP REST  (JWT Bearer Token)
                           │  http://localhost:5000
┌──────────────────────────▼──────────────────────────────────┐
│                         SERVER                              │
│  Express 5 · TypeScript · Zod validation · JWT              │
│                                                             │
│  src/                                                       │
│  ├── routes/       → Auth, Posyandu, Balita, Lansia         │
│  ├── controllers/  → Business logic handlers                │
│  ├── services/     → Prisma queries                         │
│  ├── middlewares/  → Auth, validation, error handling       │
│  └── lib/          → Prisma client, Zod schemas             │
└──────────────────────────┬──────────────────────────────────┘
                           │  Prisma ORM
┌──────────────────────────▼──────────────────────────────────┐
│                       DATABASE                              │
│  PostgreSQL (Supabase) via PgBouncer connection pooling     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Client
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| Next.js | 16 | React framework (App Router) |
| React | 19 | UI library |
| TypeScript | 5 | Type safety |
| TailwindCSS | 3 | Utility-first CSS |
| Lucide React | latest | Icon library |

### Server
| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| Node.js | 20+ | JavaScript runtime |
| Express | 5 | HTTP framework |
| TypeScript | 5 | Type safety |
| Prisma | latest | ORM |
| PostgreSQL | 15 | Database (Supabase) |
| JWT | - | Autentikasi stateless |
| bcryptjs | - | Hashing password |
| Zod | - | Schema validation |
| Helmet | - | HTTP security headers |
| Morgan | - | HTTP request logging |

---

## 📁 Struktur Proyek

```
sistem-posyandu/
├── client/                     # Frontend Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      # Root layout + AuthProvider
│   │   │   ├── page.tsx        # Main app shell (auth wall)
│   │   │   └── login/
│   │   │       └── page.tsx    # Login + Register posyandu
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # Auth state, token management
│   │   ├── lib/
│   │   │   └── api.ts          # Typed API client
│   │   ├── features/
│   │   │   ├── dashboard/      # Dashboard overview module
│   │   │   ├── balita/         # Balita management module
│   │   │   ├── lansia/         # Lansia management module
│   │   │   ├── pelayanan/      # Pelayanan module
│   │   │   ├── riwayat/        # Riwayat module
│   │   │   ├── pengaturan/     # Settings module
│   │   │   └── bantuan/        # Help module
│   │   └── components/
│   │       └── Modal.tsx       # Reusable modal
│   ├── .env.local              # NEXT_PUBLIC_API_URL
│   └── package.json
│
└── server/                     # Backend Express
    ├── src/
    │   ├── index.ts            # Server entry point
    │   ├── app.ts              # Express setup (CORS, middleware)
    │   ├── routes/             # API route definitions
    │   │   ├── auth.routes.ts
    │   │   ├── posyandu.routes.ts
    │   │   ├── balita.routes.ts
    │   │   ├── lansia.routes.ts
    │   │   └── dashboard.routes.ts
    │   ├── controllers/        # Request handlers
    │   ├── services/           # Prisma queries + helpers
    │   ├── middlewares/        # Auth, validation, error
    │   └── lib/
    │       ├── prisma.ts       # Prisma client singleton
    │       └── schemas.ts      # Zod validation schemas
    ├── prisma/
    │   └── schema.prisma       # Database schema
    ├── .env                    # Server environment variables
    └── package.json
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- **Node.js** >= 20
- **PostgreSQL** (atau akun Supabase gratis)
- npm

### 1. Clone repository

```bash
git clone <repo-url>
cd sistem-posyandu
```

### 2. Setup Server

```bash
cd server

# Install dependencies
npm install

# Salin dan isi environment variables
cp .env.example .env
# → Edit .env dengan DATABASE_URL, JWT_SECRET, dll.

# Jalankan migrasi database
npx prisma migrate deploy

# (Opsional) Seed data awal
npx prisma db seed

# Jalankan server
npm run dev
# ✅ Server berjalan di http://localhost:5000
```

### 3. Setup Client

```bash
cd client

# Install dependencies
npm install

# Buat file environment
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Jalankan client
npm run dev
# ✅ Client berjalan di http://localhost:3000
```

### 4. Buka di browser

Buka **http://localhost:3000**

> 💡 **Pertama kali?** Klik **"Daftarkan Posyandu"** untuk membuat posyandu baru + akun pengelola (OWNER) secara otomatis.

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/api/auth/register-posyandu` | ❌ Publik | Daftar posyandu baru + akun OWNER (auto-login) |
| `POST` | `/api/auth/register` | ❌ Publik | Daftar kader ke posyandu yang sudah ada |
| `POST` | `/api/auth/login` | ❌ Publik | Login, mendapat JWT |
| `GET`  | `/api/auth/me` | ✅ JWT | Info kader yang sedang login |

#### Body: `POST /api/auth/register-posyandu`
```json
{
  "namaPosyandu": "Posyandu Sri Lestari",
  "desa": "Karanggayam",
  "kecamatan": "Salaman",
  "alamat": "Jl. Raya No. 1, RT 02/RW 03",
  "namaKader": "Ibu Aminah",
  "email": "aminah@posyandu.id",
  "password": "password123"
}
```

#### Body: `POST /api/auth/login`
```json
{
  "email": "aminah@posyandu.id",
  "password": "password123"
}
```

---

### Posyandu
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET`  | `/api/posyandu` | ✅ | Daftar semua posyandu |
| `GET`  | `/api/posyandu/:id` | ✅ | Detail posyandu |
| `POST` | `/api/posyandu` | ✅ OWNER | Buat posyandu baru |
| `PATCH`| `/api/posyandu/:id` | ✅ OWNER | Update data posyandu |
| `DELETE`| `/api/posyandu/:id` | ✅ OWNER | Hapus posyandu |

### Dashboard
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET`  | `/api/dashboard/:posyanduId` | ✅ | Ringkasan statistik |

### Balita
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET`  | `/api/posyandu/:pid/balita` | ✅ | List balita (`?search=&kelompokUsia=`) |
| `GET`  | `/api/posyandu/:pid/balita/:id` | ✅ | Detail + pemeriksaan |
| `POST` | `/api/posyandu/:pid/balita` | ✅ | Tambah balita |
| `PATCH`| `/api/posyandu/:pid/balita/:id` | ✅ | Update balita |
| `DELETE`| `/api/posyandu/:pid/balita/:id` | ✅ | Hapus balita |
| `GET`  | `/api/posyandu/:pid/balita/:bid/pemeriksaan` | ✅ | Riwayat pemeriksaan |
| `POST` | `/api/posyandu/:pid/balita/:bid/pemeriksaan` | ✅ | Tambah pemeriksaan |
| `PATCH`| `/api/posyandu/:pid/balita/:bid/pemeriksaan/:id` | ✅ | Edit pemeriksaan |
| `DELETE`| `/api/posyandu/:pid/balita/:bid/pemeriksaan/:id` | ✅ | Hapus pemeriksaan |

### Lansia
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET`  | `/api/posyandu/:pid/lansia` | ✅ | List lansia (`?search=&kelompokUmur=&ht=&dm=`) |
| `GET`  | `/api/posyandu/:pid/lansia/:id` | ✅ | Detail + pemeriksaan |
| `POST` | `/api/posyandu/:pid/lansia` | ✅ | Tambah lansia |
| `PATCH`| `/api/posyandu/:pid/lansia/:id` | ✅ | Update lansia |
| `DELETE`| `/api/posyandu/:pid/lansia/:id` | ✅ | Hapus lansia |
| `GET`  | `/api/posyandu/:pid/lansia/:lid/pemeriksaan` | ✅ | Riwayat pemeriksaan |
| `POST` | `/api/posyandu/:pid/lansia/:lid/pemeriksaan` | ✅ | Tambah pemeriksaan |
| `PATCH`| `/api/posyandu/:pid/lansia/:lid/pemeriksaan/:id` | ✅ | Edit pemeriksaan |
| `DELETE`| `/api/posyandu/:pid/lansia/:lid/pemeriksaan/:id` | ✅ | Hapus pemeriksaan |

> **Auth header:** `Authorization: Bearer <JWT_TOKEN>`

---

## 🗄️ Database Schema

```
Posyandu          → Kader[], Balita[], Lansia[]
  id, nama, desa, kecamatan, alamat, createdAt

Kader             → Posyandu (many-to-one)
  id, nama, email, password (bcrypt), role (OWNER|KADER), isActive

Balita            → Posyandu, PemeriksaanBalita[]
  id, nama, nik, tanggalLahir, jenisKelamin, namaIbu, alamat

PemeriksaanBalita → Balita
  id, tanggalPeriksa, usiaBulan
  beratBadan (kg), tinggiBadan (cm), lingkarKepala (cm)
  statusBbU, statusTbU, statusBbTb   ← status gizi
  vitaminA (boolean)

Lansia            → Posyandu, PemeriksaanLansia[]
  id, nama, nik, noBpjs, tanggalLahir, jenisKelamin
  rtRw, alamat, riwayatHt, riwayatDm (boolean)
  tingkatKemandirian (A|B|C), gangguanMentalEmosional

PemeriksaanLansia → Lansia
  id, tanggalPeriksa
  beratBadan (kg), tinggiBadan (cm)
  tekananDarahSistol (mmHg), tekananDarahDiastol (mmHg)
  gulaDarahSewaktu (mg/dL), lingkarPerut (cm)
```

---

## 🔧 Environment Variables

### Server — `server/.env`

```env
# Database (Supabase / PostgreSQL)
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/db"

# Server
PORT=5000
NODE_ENV=development

# JWT (ganti dengan key acak min. 32 karakter di production!)
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:3000
```

### Client — `client/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🔄 Alur Penggunaan

```
Buka http://localhost:3000
       ↓
┌──────────────────────┐    ┌─────────────────────────────────┐
│  Sudah punya akun?   │    │  Posyandu baru?                 │
│  → Masuk             │    │  → Daftarkan Posyandu           │
│    (Email + Password)│    │    Step 1: Data posyandu        │
│    → Login otomatis  │    │    Step 2: Akun pengelola       │
└──────────┬───────────┘    │    → Dibuat + Login otomatis    │
           └────────────────┴────────────┐
                                         ↓
                              Dashboard (data real-time)
                              ├── Balita → CRUD + Pemeriksaan
                              ├── Lansia → CRUD + Pemeriksaan
                              ├── Riwayat pemeriksaan
                              └── Pengaturan posyandu
```

---

## 👥 Peran Kader

| Peran | Kemampuan |
|-------|-----------|
| `OWNER` | Akses penuh: kelola posyandu, kader, semua data |
| `KADER` | Tambah & lihat data balita/lansia milik posyandunya |

---

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch baru: `git checkout -b fitur/nama-fitur`
3. Commit perubahan: `git commit -m "feat: tambah fitur X"`
4. Push: `git push origin fitur/nama-fitur`
5. Buat Pull Request

### Konvensi Commit
- `feat:` fitur baru
- `fix:` perbaikan bug
- `docs:` perubahan dokumentasi
- `refactor:` refactoring kode
- `style:` perubahan tampilan

---

## 📄 Lisensi

MIT License — bebas digunakan untuk keperluan pendidikan dan non-komersial.

---

<div align="center">
  <p>© 2026 SIPANDU - Sistem Informasi Pelayanan dan Data Posyandu</p>
</div>
