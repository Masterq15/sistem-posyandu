# 🤝 Panduan Kontribusi Tim (Workflow Fork & Pull Request)

Dokumen ini berisi panduan alur kerja (*workflow*) bagi anggota tim untuk berkontribusi pada pengembangan **Sistem Informasi Posyandu** menggunakan metode **Fork, Branch, dan Pull Request (PR)**.

---

## 📌 Langkah 1: Fork Repository Utama

1. Buka halaman repository utama di GitHub: `https://github.com/yuriya-dev/sistem-posyandu`.
2. Di pojok kanan atas halaman, klik tombol **Fork**.
3. Pilih akun GitHub kamu, lalu klik **Create Fork**.
4. Sekarang kamu telah memiliki salinan (*copy*) repository proyek di akun GitHub pribadimu (`https://github.com/username-kamu/sistem-posyandu`).

---

## 📌 Langkah 2: Clone Fork ke Komputer Lokal

1. Buka terminal (Git Bash, Terminal, PowerShell, atau Command Prompt).
2. Clone repository milikmu (hasil fork):
   ```bash
   git clone https://github.com/username-kamu/sistem-posyandu.git
   ```
3. Masuk ke direktori proyek:
   ```bash
   cd sistem-posyandu
   ```
4. Tambahkan repository utama (**upstream**) agar dapat menyinkronkan pembaruan kode terbaru:
   ```bash
   git remote add upstream https://github.com/pemilik-repo/sistem-posyandu.git
   ```
5. Verifikasi remote repository:
   ```bash
   git remote -v
   # Harus menampilkan origin (fork kamu) dan upstream (repo utama)
   ```

---

## 📌 Langkah 3: Buat Branch Baru untuk Fitur / Task

> ⚠️ **Penting:** Hindari melakukan commit langsung di branch `main`. Selalu buat branch baru khusus untuk tugas/fitur yang sedang dikerjakan.

```bash
git checkout -b feat/nama-fitur-kamu
# Contoh: git checkout -b feat/ekspor-pdf
# Contoh: git checkout -b fix/form-validation
```

---

## 📌 Langkah 4: Kerjakan Task & Commit Perubahan

1. Lakukan perubahan atau penambahan kode pada editor (VS Code, Cursor, dll).
2. Periksa status file yang diubah:
   ```bash
   git status
   ```
3. Tambahkan file yang telah diubah ke staging area:
   ```bash
   git add .
   ```
4. Buat commit dengan pesan yang jelas (mengikuti standar *Conventional Commits*):
   ```bash
   git commit -m "feat: menambah fitur ekspor pdf laporan posyandu"
   ```

---

## 📌 Langkah 5: Push Branch ke Fork GitHub

Kirimkan branch lokal kamu ke repository fork di akun GitHub-mu:

```bash
git push origin feat/nama-fitur-kamu
```

---

## 📌 Langkah 6: Buat Pull Request (PR)

1. Buka browser dan pergi ke halaman repository fork milikmu di GitHub.
2. Kamu akan melihat banner pemberitahuan bertuliskan **"feat/nama-fitur-kamu had recent pushes"** beserta tombol **Compare & pull request**. Klik tombol tersebut.
3. Pastikan konfigurasi pengiriman PR sudah benar:
   - **base repository:** `pemilik-repo/sistem-posyandu` | **base:** `main`
   - **head repository:** `username-kamu/sistem-posyandu` | **compare:** `feat/nama-fitur-kamu`
4. Isi **Judul PR** dan penjelasan pada **Deskripsi**:
   - Jelaskan fitur atau perbaikan yang dikerjakan.
   - Lampirkan screenshot/video jika ada perubahan pada UI.
5. Klik **Create Pull Request**.

---

## 💡 Tips Tambahan: Menjaga Repo Fork Tetap Up-to-Date (Sync Upstream)

Sebelum membuat Pull Request atau sebelum memulai tugas baru, pastikan branch milikmu selalu menyinkronkan perubahan terbaru dari repository utama:

```bash
# 1. Pindah ke branch main lokal dan ambil kode terbaru dari repo utama (upstream)
git checkout main
git pull upstream main

# 2. Update branch fork kamu di GitHub
git push origin main

# 3. Gabungkan perubahan terbaru ke branch fitur kamu
git checkout feat/nama-fitur-kamu
git merge main
```

---
*Selamat berkontribusi! Jangan ragu mendiskusikan pertanyaan atau masukan di kolom komentar Pull Request.* 🎉
