"use client";

import { useState } from "react";
import {
  User,
  HelpCircle,
  Search,
  BookOpen,
  ShieldAlert,
  Users,
  PhoneCall,
  FileText,
  ArrowLeft,
  HelpCircle as InfoIcon,
  ListTodo,
  Table as TableIcon,
  Scale,
  Ruler,
  CheckCircle2,
  AlertCircle,
  Download,
  TrendingUp,
  Database,
  Calendar,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  Activity,
  Droplet,
  Sparkles,
  Info
} from "lucide-react";
import PageHelmet from "../../components/PageHelmet";
import LansiaIcon from "../../components/LansiaIcon";
import BalitaIcon from "../../components/BalitaIcon";
import { useAuth } from "../../contexts/AuthContext";
import { BBU_DATA, TBU_DATA, BBTB_DATA } from "../../lib/antropometriData";

interface Guide {
  id: string;
  title: string;
  category: "kader" | "owner";
  description: string;
  icon: any;
  steps: {
    title: string;
    text: string;
    badge?: string;
  }[];
}

interface FaqItem {
  id: string;
  category: "Umum" | "Balita" | "Lansia" | "Akun & Keamanan";
  question: string;
  answer: string;
}

export default function BantuanModule() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);

  // Kategori Standar Acuan: Balita vs Lansia
  const [standardCategory, setStandardCategory] = useState<"balita" | "lansia">("balita");

  // State Tabel Balita (Permenkes 2/2020)
  const [tableTab, setTableTab] = useState<"bbu" | "tbu" | "bbtb">("bbu");
  const [tableJk, setTableJk] = useState<"L" | "P">("L");
  const [tableSearch, setTableSearch] = useState("");

  // State Tabel Acuan Lansia (Kemenkes RI)
  const [lansiaTab, setLansiaTab] = useState<"tensi" | "gula" | "asam_kolesterol" | "kemandirian">("tensi");

  // State FAQ Accordion
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq1");
  const [faqFilter, setFaqFilter] = useState<"Semua" | "Balita" | "Lansia" | "Akun & Keamanan" | "Umum">("Semua");

  // Kamus Istilah Sederhana (Glossary)
  const glossary = [
    { istilah: "Stunting (Kerdil)", arti: "Kondisi anak yang terlalu pendek dibanding usianya akibat kekurangan gizi kronis dalam waktu lama (PB/U atau TB/U < -2 SD)." },
    { istilah: "Wasting (Kurus)", arti: "Kondisi anak dengan berat badan terlalu kurus dibanding tinggi badannya (BB/PB atau BB/TB < -2 SD)." },
    { istilah: "Underweight (BB Kurang)", arti: "Kondisi berat badan anak yang kurang dibanding usianya (BB/U < -2 SD)." },
    { istilah: "Status N (Naik)", arti: "Berat badan balita bertambah mengikuti garis kurva pertumbuhan dan melampaui Kenaikan Berat Minimal (KBM)." },
    { istilah: "Status T (Tidak Naik)", arti: "Berat badan balita turun, tetap, atau kenaikannya tidak mencapai standar KBM pada KMS." },
    { istilah: "Z-Score (Standar Deviasi)", arti: "Indikator baku WHO / Permenkes No. 2/2020 untuk menilai status gizi dan pertumbuhan anak dibanding standar anak sehat." },
    { istilah: "Kapsul Vitamin A", arti: "Diberikan serentak tiap Februari & Agustus. Kapsul biru (100.000 IU) untuk bayi 6-11 bulan, kapsul merah (200.000 IU) untuk balita 12-59 bulan." },
    { istilah: "Obat Cacing", arti: "Diberikan minimal 1 kali setahun untuk anak di atas 1 tahun untuk mencegah cacingan dan risiko anemia gizi." },
    { istilah: "Hipertensi", arti: "Tekanan darah tinggi (sistol di atas 140 mmHg atau diastol di atas 90 mmHg)." },
    { istilah: "Sistol & Diastol", arti: "Hasil tensi darah. Sistol adalah angka atas (saat jantung memompa), diastol adalah angka bawah (saat jantung relaksasi)." },
    { istilah: "GDS (Gula Darah Sewaktu)", arti: "Pemeriksaan kadar glukosa darah sewaktu-waktu tanpa harus berpuasa (angka normal di bawah 140 mg/dL)." },
    { istilah: "Indeks Barthel (AKS)", arti: "Instrumen penilaian fungsional untuk mengukur tingkat kemandirian lansia dalam aktivitas sehari-hari (Mandiri, Sebagian, Total)." },
  ];

  // FAQ List
  const faqList: FaqItem[] = [
    {
      id: "faq1",
      category: "Balita",
      question: "Bagaimana jika balita sudah berusia di atas 5 tahun (60 bulan)?",
      answer: "Balita yang melewati usia 60 bulan dinyatakan 'Lulus Posyandu'. Seluruh data rekam medisnya tetap tersimpan utuh di sistem untuk kebutuhan arsip kesehatan, namun anak tersebut secara otomatis tidak lagi dimasukkan ke dalam target sasaran penimbangan bulanan balita."
    },
    {
      id: "faq2",
      category: "Balita",
      question: "Kapan jadwal pembagian Vitamin A dan Obat Cacing di Posyandu?",
      answer: "Vitamin A dibagikan secara serentak 2 kali setahun, yaitu pada bulan FEBRUARI dan AGUSTUS. Kapsul Biru (100.000 IU) untuk bayi usia 6-11 bulan, dan Kapsul Merah (200.000 IU) untuk balita 12-59 bulan. Obat Cacing umumnya diberikan bersamaan pada bulan Agustus untuk anak usia di atas 1 tahun."
    },
    {
      id: "faq3",
      category: "Balita",
      question: "Kenapa garis grafik KMS pertumbuhan balita tampak putus-putus atau meloncat?",
      answer: "Garis KMS menghubungkan titik hasil penimbangan dari bulan ke bulan. Apabila balita tidak hadir (absen) pada salah satu bulan, garis grafik akan terputus sesuai kaidah baku KMS Kemenkes sampai balita hadir kembali pada penimbangan berikutnya."
    },
    {
      id: "faq4",
      category: "Lansia",
      question: "Berapa batas normal tensi darah dan gula darah pada lansia?",
      answer: "Tekanan darah optimal lansia adalah di bawah 120/80 mmHg. Jika sistol 120-139 atau diastol 80-89 tergolong pra-hipertensi, dan ≥140/90 sudah hipertensi. Untuk Gula Darah Sewaktu (GDS), angka normal adalah < 140 mg/dL. Di atas 200 mg/dL perlu dirujuk ke Puskesmas."
    },
    {
      id: "faq5",
      category: "Akun & Keamanan",
      question: "Bagaimana jika salah satu kader lupa kata sandi akunnya?",
      answer: "Kader dapat meminta bantuan kader dengan status 'Owner' di Posyandu Anda untuk mengubah atau mereset kata sandi melalui menu 'Manajemen Akun'. Jika akun Owner yang lupa password, gunakan opsi 'Lupa Password' di halaman login."
    },
    {
      id: "faq6",
      category: "Akun & Keamanan",
      question: "Apakah data warga atau rekam medis yang terhapus bisa dikembalikan?",
      answer: "Data yang dihapus dari database tidak dapat dikembalikan secara otomatis. Oleh karena itu, akun Owner sangat dianjurkan untuk mengunduh Backup Data (.json) secara berkala di menu Pengaturan setiap selesai pelayanan posyandu."
    },
    {
      id: "faq7",
      category: "Umum",
      question: "Apakah aplikasi Posyandu ini bisa dibuka lewat HP atau Tablet?",
      answer: "Ya! Sistem dirancang responsif dan kompatibel dengan smartphone Android, iPhone, tablet, maupun laptop kader. Kader dapat langsung mencatat pelayanan di meja penimbangan melalui perangkat seluler asalkan terhubung internet."
    }
  ];

  // Panduan Langkah Demi Langkah (Step-by-Step Guides)
  const guides: Guide[] = [
    {
      id: "g1",
      title: "Mencatat Pemeriksaan Bulanan",
      category: "kader",
      description: "Cara mencatat berat badan, tinggi badan, tensi, dan vit A saat pelayanan posyandu berlangsung.",
      icon: FileText,
      steps: [
        { title: "Langkah 1: Masuk Menu Pelayanan", text: "Klik tombol 'Pelayanan' di menu navigasi utama." },
        { title: "Langkah 2: Pilih Halaman Balita / Lansia", text: "Klik tombol Balita atau Lansia di bagian atas untuk berpindah halaman pelayanan." },
        { title: "Langkah 3: Cari Nama Warga & Isi Formulir", text: "Pilih nama warga di panel kiri, lalu masukkan data hasil penimbangan / pemeriksaan medis pada formulir di sebelah kanan." },
        { title: "Langkah 4: Klik Simpan", text: "Periksa kembali angka yang dimasukkan, lalu klik tombol 'Simpan Pemeriksaan'. Data akan langsung terekam.", badge: "Penting" }
      ]
    },
    {
      id: "g2",
      title: "Mendaftarkan Balita Baru",
      category: "kader",
      description: "Cara mendaftarkan anak/bayi yang baru pertama kali datang ke posyandu.",
      icon: BalitaIcon,
      steps: [
        { title: "Langkah 1: Klik Tombol Balita Baru", text: "Buka menu 'Pelayanan', lalu klik tombol '+ Balita Baru' di sudut kanan atas halaman." },
        { title: "Langkah 2: Isi Nama & Tanggal Lahir", text: "Masukkan Nama Lengkap anak, NIK (jika ada di kartu keluarga), dan Tanggal Lahir (sistem akan menghitung usianya secara otomatis)." },
        { title: "Langkah 3: Masukkan Nama Ibu", text: "Masukkan nama lengkap ibu kandung untuk mencocokkan identitas anak." },
        { title: "Langkah 4: Klik Daftar & Pilih", text: "Klik tombol 'Daftarkan & Pilih'. Anak baru akan otomatis tersimpan ke daftar warga dan formulir rekam medisnya langsung terbuka untuk diisi." }
      ]
    },
    {
      id: "g3",
      title: "Mendaftarkan Lansia Baru",
      category: "kader",
      description: "Cara mendaftarkan warga lansia baru di lingkungan posyandu.",
      icon: LansiaIcon,
      steps: [
        { title: "Langkah 1: Klik Tombol Lansia Baru", text: "Buka menu 'Pelayanan', lalu klik tombol '+ Lansia Baru' di sudut kanan atas halaman." },
        { title: "Langkah 2: Isi NIK & BPJS", text: "Ketik NIK 16 digit sesuai KTP lansia dan nomor kartu BPJS (jika ada)." },
        { title: "Langkah 3: Pilih Tingkat Kemandirian", text: "Pilih status kemandirian lansia (Kategori A: Mandiri, B: Bantuan Sebagian, C: Tergantung Total)." },
        { title: "Langkah 4: Klik Daftar", text: "Klik tombol 'Daftarkan & Pilih' untuk menyimpan. Lansia tersebut langsung terdaftar sebagai peserta aktif posyandu." }
      ]
    },
    {
      id: "g4",
      title: "Mengoreksi / Mengubah Salah Ketik Data",
      category: "kader",
      description: "Cara membetulkan data pemeriksaan warga jika kader tidak sengaja salah menginput angka.",
      icon: ShieldAlert,
      steps: [
        { title: "Langkah 1: Buka Data Warga", text: "Klik menu 'Balita' atau 'Lansia' di sebelah kiri, cari nama warga yang datanya salah." },
        { title: "Langkah 2: Buka Profil Detail", text: "Klik tombol abu-abu 'Detail Data' di sebelah kanan nama warga tersebut." },
        { title: "Langkah 3: Lihat Tabel Riwayat", text: "Gulir layar ke bawah. Di sana terdapat tabel berisi seluruh hasil pemeriksaan dari bulan ke bulan." },
        { title: "Langkah 4: Klik Edit / Hapus", text: "Klik tombol pensil untuk mengedit atau tombol hapus di samping baris bulan yang salah ketik." }
      ]
    },
    {
      id: "g5",
      title: "Mendaftarkan Kader / Anggota Baru",
      category: "owner",
      description: "Panduan untuk kader Owner dalam mengundang kader pembantu baru.",
      icon: Users,
      steps: [
        { title: "Langkah 1: Buka Manajemen Akun", text: "Klik menu 'Manajemen Akun' di sidebar kiri (khusus akun berstatus Owner)." },
        { title: "Langkah 2: Klik Buat Akun", text: "Klik tombol 'Buat Akun Kader Baru' di kanan atas." },
        { title: "Langkah 3: Buat Username & Password", text: "Masukkan Nama Lengkap, Email, Kata Sandi awal (misal: 123456), dan tentukan perannya (Anggota/Owner)." },
        { title: "Langkah 4: Bagikan Akses", text: "Klik Simpan. Berikan email dan kata sandi tersebut kepada kader baru agar mereka bisa langsung masuk ke sistem." }
      ]
    },
    {
      id: "g6",
      title: "Mengunduh & Cetak Laporan (Excel & PDF)",
      category: "kader",
      description: "Cara mengekspor rekapitulasi data bulanan posyandu balita & lansia untuk Puskesmas atau arsip.",
      icon: Download,
      steps: [
        { title: "Langkah 1: Buka Menu Laporan", text: "Klik menu 'Laporan' di bilah navigasi samping." },
        { title: "Langkah 2: Pilih Sasaran & Periode", text: "Pilih tab 'Laporan Balita' atau 'Laporan Lansia', kemudian tentukan bulan dan tahun pelayanan yang ingin direkap." },
        { title: "Langkah 3: Periksa Pratinjau Tabel", text: "Tinjau ringkasan kehadiran, status gizi balita (Z-score), atau kategori tensi lansia pada tabel pratinjau di layar." },
        { title: "Langkah 4: Klik Unduh File", text: "Klik 'Ekspor Excel' untuk format rekapitulasi pelaporan Puskesmas / F1-Gizi, atau 'Cetak PDF' untuk dokumen fisik arsip posyandu.", badge: "Praktis" }
      ]
    },
    {
      id: "g7",
      title: "Membaca Grafik Pertumbuhan KMS Balita",
      category: "kader",
      description: "Panduan memahami kurva pertumbuhan balita, arti warna garis Z-Score, dan status N / T.",
      icon: TrendingUp,
      steps: [
        { title: "Langkah 1: Buka Detail Balita", text: "Buka menu 'Balita', cari nama anak, lalu klik 'Detail Data' untuk melihat Grafik KMS pertumbuhan interaktif." },
        { title: "Langkah 2: Kenali Garis Z-Score", text: "Garis Hijau = Pertumbuhan Normal. Garis Kuning = Waspada / Ambang Batas (-2 SD s/d -3 SD). Garis Merah = Gizi Buruk / Sangat Pendek (< -3 SD)." },
        { title: "Langkah 3: Perhatikan Status N atau T", text: "Status 'N' (Naik) berarti berat badan naik mengikuti kurva kenaikan minimal (KBM). Status 'T' (Tidak Naik) berarti berat badan turun, tetap, atau kenaikannya kurang dari KBM." },
        { title: "Langkah 4: Tindakan Rujukan", text: "Jika grafik berada di Bawah Garis Merah (BGM) atau 2 kali penimbangan berturut-turut Tidak Naik (2T), segera koordinasikan dengan Bidan Desa untuk rujukan ke Puskesmas.", badge: "Penting" }
      ]
    },
    {
      id: "g8",
      title: "Backup & Keamanan Data Posyandu",
      category: "owner",
      description: "Langkah mencadangkan seluruh data posyandu ke file JSON aman untuk mencegah kehilangan data.",
      icon: Database,
      steps: [
        { title: "Langkah 1: Masuk Menu Pengaturan", text: "Klik menu 'Pengaturan' di navigasi utama (khusus hak akses Owner)." },
        { title: "Langkah 2: Pilih Tab Data & Keamanan", text: "Pilih menu 'Data & Keamanan' di dalam panel pengaturan sistem." },
        { title: "Langkah 3: Unduh File Cadangan", text: "Klik tombol 'Unduh Backup Data (.json)'. Sistem akan otomatis mengemas seluruh data profil, kader, balita, lansia, dan rekam medis ke dalam satu berkas." },
        { title: "Langkah 4: Simpan di Tempat Aman", text: "Simpan file cadangan tersebut di flashdisk atau penyimpanan cloud (Google Drive) posyandu secara berkala setiap akhir bulan pelayanan posyandu.", badge: "Rekomendasi" }
      ]
    },
    {
      id: "g9",
      title: "Memilih Periode & Jadwal Pelayanan",
      category: "kader",
      description: "Cara memastikan bulan periode pemeriksaan aktif saat hari-H pelayanan posyandu berlangsung.",
      icon: Calendar,
      steps: [
        { title: "Langkah 1: Periksa Periode Aktif", text: "Di pojok atas halaman utama atau menu Pelayanan, perhatikan label bulan dan tahun periode yang sedang dibuka." },
        { title: "Langkah 2: Buka Periode Baru", text: "Jika memasuki jadwal posyandu bulan baru, klik tombol pemilihan periode lalu buka/aktifkan periode bulan berjalan." },
        { title: "Langkah 3: Mulai Input Penimbangan", text: "Setelah periode sesuai, kader siap menginput data penimbangan anak dan cek kesehatan lansia pada hari-H." }
      ]
    }
  ];

  // Filter guides based on search query
  const filteredGuides = guides.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedGuide = guides.find((g) => g.id === activeGuideId);

  // Filter FAQ based on category and search
  const filteredFaqs = faqList.filter((f) => {
    const matchCategory = faqFilter === "Semua" || f.category === faqFilter;
    const matchSearch =
      !searchQuery ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Filter Glossary based on search
  const filteredGlossary = glossary.filter((g) =>
    !searchQuery ||
    g.istilah.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.arti.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper filter tabel antropometri balita
  const getTableRows = () => {
    if (tableTab === "bbu") {
      const data = BBU_DATA[tableJk];
      return Object.entries(data).map(([umur, sds]) => ({
        label: `${umur} Bulan`,
        valNum: parseInt(umur, 10),
        sds
      })).filter(row => !tableSearch || row.label.toLowerCase().includes(tableSearch.toLowerCase()) || row.valNum.toString().includes(tableSearch));
    } else if (tableTab === "tbu") {
      const data = TBU_DATA[tableJk];
      return Object.entries(data).map(([umur, sds]) => ({
        label: parseInt(umur, 10) <= 24 ? `${umur} Bulan (PB)` : `${umur} Bulan (TB)`,
        valNum: parseInt(umur, 10),
        sds
      })).filter(row => !tableSearch || row.label.toLowerCase().includes(tableSearch.toLowerCase()) || row.valNum.toString().includes(tableSearch));
    } else {
      const data = BBTB_DATA[tableJk];
      return data.map(item => ({
        label: `${item.tb} cm`,
        valNum: item.tb,
        sds: item.sds
      })).filter(row => !tableSearch || row.label.toLowerCase().includes(tableSearch.toLowerCase()) || row.valNum.toString().includes(tableSearch));
    }
  };

  const tableRows = getTableRows();

  return (
    <div className="space-y-8 pb-10">
      <PageHelmet
        title="Pusat Bantuan & Standar Acuan"
        description="Panduan operasional posyandu, FAQ, tabel antropometri Permenkes 2/2020, acuan medis lansia, dan kontak rujukan."
      />

      {/* View Detail Panduan */}
      {selectedGuide ? (
        <div className="space-y-6 max-w-3xl">
          <button
            onClick={() => setActiveGuideId(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-saas-primary hover:underline transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Pusat Bantuan
          </button>

          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-saas-primary/10 flex items-center justify-center text-saas-primary shrink-0">
                <selectedGuide.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-saas-dark">{selectedGuide.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    selectedGuide.category === "owner" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"
                  }`}>
                    {selectedGuide.category === "owner" ? "Khusus Owner" : "Kader"}
                  </span>
                </div>
                <p className="text-xs text-saas-muted mt-0.5">{selectedGuide.description}</p>
              </div>
            </div>

            {/* Steps Container */}
            <div className="space-y-4 pt-4 border-t border-gray-50">
              {selectedGuide.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-gray-50 border border-gray-100/55 rounded-xl text-xs">
                  <div className="w-8 h-8 rounded-full bg-saas-primary/15 flex items-center justify-center text-saas-primary font-black shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-saas-dark">{step.title}</h4>
                      {step.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[9px]">
                          {step.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-saas-muted font-semibold leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
              <button
                onClick={() => setActiveGuideId(null)}
                className="px-5 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-colors"
              >
                Sudah Paham, Kembali
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Main Help View
        <div className="space-y-8">
          {/* Header Banner & Search Box */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-xl space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-saas-primary font-extrabold text-[10px] border border-teal-200/50">
                    Pusat Pengetahuan & Panduan
                  </span>
                  {user?.posyandu?.nama && (
                    <span className="text-[11px] font-bold text-saas-muted">
                      • {user.posyandu.nama}
                    </span>
                  )}
                </div>
                <h2 className="font-extrabold text-lg text-saas-dark">Ada kendala apa hari ini?</h2>
                <p className="text-xs text-saas-muted leading-relaxed">
                  Cari panduan langkah demi langkah, standar rujukan balita & lansia, atau solusi kendala seputar posyandu.
                </p>
              </div>

              <div className="relative w-full md:w-80 shrink-0">
                <input
                  type="text"
                  placeholder="Ketik kata kunci, misal: laporan, KMS, tensi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200/70 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 focus:bg-white transition-all"
                />
                <Search className="absolute left-3.5 top-3 text-saas-muted w-4 h-4" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-[10px] text-gray-400 hover:text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Guides Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-saas-primary" />
                <h3 className="font-extrabold text-sm text-saas-dark">Panduan Praktis Operasional</h3>
              </div>
              <span className="text-[11px] font-bold text-saas-muted">
                {filteredGuides.length} Panduan Tersedia
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGuides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <button
                    key={guide.id}
                    onClick={() => setActiveGuideId(guide.id)}
                    className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-5 text-left flex gap-4 hover:border-saas-primary/35 hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className="w-10 h-10 rounded-xl bg-saas-primary/10 text-saas-primary flex items-center justify-center shrink-0 group-hover:bg-saas-primary group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-xs text-saas-dark group-hover:text-saas-primary transition-colors">
                          {guide.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-saas-muted leading-normal font-semibold line-clamp-2">
                        {guide.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-saas-primary font-bold group-hover:underline">
                          Lihat Langkah →
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          guide.category === "owner" ? "bg-purple-50 text-purple-600" : "bg-teal-50 text-teal-600"
                        }`}>
                          {guide.category === "owner" ? "Owner" : "Kader"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TABEL STANDAR ACUAN MEDIS: BALITA & LANSIA */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-saas-primary flex items-center justify-center shrink-0">
                  <TableIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-saas-dark flex items-center gap-2">
                    Tabel Standar & Acuan Pemeriksaan
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 rounded-full">
                      Resmi Kemenkes RI
                    </span>
                  </h3>
                  <p className="text-xs text-saas-muted mt-0.5">
                    Pedoman nilai baku untuk mempermudah kader dalam menilai status gizi anak dan kondisi kesehatan lansia.
                  </p>
                </div>
              </div>

              {/* Toggle Balita vs Lansia */}
              <div className="flex items-center bg-gray-100/90 p-1 rounded-xl shrink-0 gap-1 border border-gray-200/50 self-start lg:self-auto">
                <button
                  onClick={() => setStandardCategory("balita")}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
                    standardCategory === "balita"
                      ? "bg-white text-saas-dark shadow-sm"
                      : "text-saas-muted hover:text-saas-dark"
                  }`}
                >
                  <BalitaIcon className="w-4 h-4 text-teal-600" />
                  Standar Balita (Permenkes 2/2020)
                </button>
                <button
                  onClick={() => setStandardCategory("lansia")}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
                    standardCategory === "lansia"
                      ? "bg-white text-saas-dark shadow-sm"
                      : "text-saas-muted hover:text-saas-dark"
                  }`}
                >
                  <LansiaIcon className="w-4 h-4 text-indigo-600" />
                  Standar Medis Lansia
                </button>
              </div>
            </div>

            {/* TAB BALITA CONTENT */}
            {standardCategory === "balita" ? (
              <div className="space-y-5">
                {/* Selector Jenis Kelamin & Sub-Tab */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setTableTab("bbu")}
                      className={`px-3.5 py-2 rounded-input text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        tableTab === "bbu"
                          ? "bg-teal-50 border border-teal-200 text-saas-primary font-black"
                          : "bg-gray-50 border border-gray-100 text-saas-muted hover:bg-gray-100"
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" /> BB / U (Berat / Umur)
                    </button>
                    <button
                      onClick={() => setTableTab("tbu")}
                      className={`px-3.5 py-2 rounded-input text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        tableTab === "tbu"
                          ? "bg-teal-50 border border-teal-200 text-saas-primary font-black"
                          : "bg-gray-50 border border-gray-100 text-saas-muted hover:bg-gray-100"
                      }`}
                    >
                      <Ruler className="w-3.5 h-3.5" /> PB / U & TB / U (Tinggi / Umur)
                    </button>
                    <button
                      onClick={() => setTableTab("bbtb")}
                      className={`px-3.5 py-2 rounded-input text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        tableTab === "bbtb"
                          ? "bg-teal-50 border border-teal-200 text-saas-primary font-black"
                          : "bg-gray-50 border border-gray-100 text-saas-muted hover:bg-gray-100"
                      }`}
                    >
                      <TableIcon className="w-3.5 h-3.5" /> BB / PB & BB / TB (Berat / Tinggi)
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Selector Jenis Kelamin */}
                    <div className="flex items-center bg-gray-100/90 p-1 rounded-xl shrink-0 gap-1 border border-gray-200/50">
                      <button
                        onClick={() => setTableJk("L")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                          tableJk === "L"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-saas-muted hover:text-saas-dark"
                        }`}
                      >
                        <div className="w-4 h-4 rounded-md bg-white p-0.5 flex items-center justify-center shrink-0">
                          <img src="/baby.svg" alt="Laki-laki" className="w-3 h-3 object-contain" />
                        </div>
                        Laki-laki
                      </button>
                      <button
                        onClick={() => setTableJk("P")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                          tableJk === "P"
                            ? "bg-pink-600 text-white shadow-xs"
                            : "text-saas-muted hover:text-saas-dark"
                        }`}
                      >
                        <div className="w-4 h-4 rounded-md bg-white p-0.5 flex items-center justify-center shrink-0">
                          <img src="/girl.svg" alt="Perempuan" className="w-3 h-3 object-contain" />
                        </div>
                        Perempuan
                      </button>
                    </div>

                    <div className="relative w-40">
                      <input
                        type="text"
                        placeholder={tableTab === "bbtb" ? "Cari tinggi..." : "Cari umur..."}
                        value={tableSearch}
                        onChange={(e) => setTableSearch(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                      />
                      <Search className="absolute left-2.5 top-2 text-saas-muted w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Keterangan Kategori Kemenkes */}
                <div className="p-3.5 bg-teal-50/50 border border-teal-100/70 rounded-xl text-xs space-y-1.5">
                  <p className="font-extrabold text-teal-900 flex items-center gap-1.5">
                    <InfoIcon className="w-4 h-4 text-teal-600 shrink-0" />
                    Kategori Z-Score Permenkes No. 2 Tahun 2020 untuk {tableTab.toUpperCase()}:
                  </p>
                  {tableTab === "bbu" && (
                    <p className="text-teal-900 text-[11px] font-semibold leading-relaxed pl-5">
                      • <strong>&lt; -3 SD</strong>: Berat Badan Sangat Kurang | <strong>-3 SD s.d. &lt; -2 SD</strong>: Berat Badan Kurang | <strong>-2 SD s.d. +1 SD</strong>: Berat Badan Normal | <strong>&gt; +1 SD</strong>: Risiko Berat Badan Lebih
                    </p>
                  )}
                  {tableTab === "tbu" && (
                    <p className="text-teal-900 text-[11px] font-semibold leading-relaxed pl-5">
                      • <strong>&lt; -3 SD</strong>: Sangat Pendek (Severely Stunted) | <strong>-3 SD s.d. &lt; -2 SD</strong>: Pendek (Stunted) | <strong>-2 SD s.d. +2 SD</strong>: Normal | <strong>&gt; +2 SD</strong>: Tinggi
                    </p>
                  )}
                  {tableTab === "bbtb" && (
                    <p className="text-teal-900 text-[11px] font-semibold leading-relaxed pl-5">
                      • <strong>&lt; -3 SD</strong>: Gizi Buruk (Severely Wasted) | <strong>-3 SD s.d. &lt; -2 SD</strong>: Gizi Kurang (Wasted) | <strong>-2 SD s.d. +1 SD</strong>: Gizi Baik (Normal) | <strong>&gt; +1 SD</strong>: Gizi Lebih / Obesitas
                    </p>
                  )}
                </div>

                {/* Tabel Data Standar Antropometri */}
                <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-saas-dark font-extrabold sticky top-0 border-b border-gray-200 z-10">
                      <tr>
                        <th className="py-2.5 px-4 bg-gray-100">{tableTab === "bbtb" ? "Panjang / Tinggi" : "Umur Balita"}</th>
                        <th className="py-2.5 px-3 text-red-700 bg-red-50/50">-3 SD</th>
                        <th className="py-2.5 px-3 text-orange-700 bg-orange-50/50">-2 SD</th>
                        <th className="py-2.5 px-3 text-yellow-700 bg-yellow-50/50">-1 SD</th>
                        <th className="py-2.5 px-3 text-teal-800 bg-teal-100/60 font-black">Median (0)</th>
                        <th className="py-2.5 px-3 text-emerald-700 bg-emerald-50/50">+1 SD</th>
                        <th className="py-2.5 px-3 text-blue-700 bg-blue-50/50">+2 SD</th>
                        <th className="py-2.5 px-3 text-purple-700 bg-purple-50/50">+3 SD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold text-saas-dark">
                      {tableRows.length > 0 ? (
                        tableRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-teal-50/30 transition-colors">
                            <td className="py-2 px-4 font-bold bg-gray-50/50">{row.label}</td>
                            <td className="py-2 px-3 text-red-600 bg-red-50/20">{row.sds[0]}</td>
                            <td className="py-2 px-3 text-orange-600 bg-orange-50/20">{row.sds[1]}</td>
                            <td className="py-2 px-3 text-yellow-700 bg-yellow-50/20">{row.sds[2]}</td>
                            <td className="py-2 px-3 font-extrabold text-teal-900 bg-teal-50/60">{row.sds[3]}</td>
                            <td className="py-2 px-3 text-emerald-700 bg-emerald-50/20">{row.sds[4]}</td>
                            <td className="py-2 px-3 text-blue-700 bg-blue-50/20">{row.sds[5]}</td>
                            <td className="py-2 px-3 text-purple-700 bg-purple-50/20">{row.sds[6]}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-saas-muted font-medium">
                            Tidak ada data yang cocok dengan pencarian "{tableSearch}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-saas-muted text-right italic font-medium">
                  * Satuan BB dalam Kilogram (kg), PB/TB dalam Sentimeter (cm). Rujukan: Lampiran Permenkes RI No. 2 Tahun 2020.
                </p>
              </div>
            ) : (
              // TAB LANSIA CONTENT
              <div className="space-y-5">
                {/* Lansia Sub-Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setLansiaTab("tensi")}
                    className={`px-3.5 py-2 rounded-input text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      lansiaTab === "tensi"
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-700 font-black"
                        : "bg-gray-50 border border-gray-100 text-saas-muted hover:bg-gray-100"
                    }`}
                  >
                    <HeartPulse className="w-3.5 h-3.5" /> Tekanan Darah (Tensi)
                  </button>
                  <button
                    onClick={() => setLansiaTab("gula")}
                    className={`px-3.5 py-2 rounded-input text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      lansiaTab === "gula"
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-700 font-black"
                        : "bg-gray-50 border border-gray-100 text-saas-muted hover:bg-gray-100"
                    }`}
                  >
                    <Droplet className="w-3.5 h-3.5" /> Gula Darah (GDS / GDP)
                  </button>
                  <button
                    onClick={() => setLansiaTab("asam_kolesterol")}
                    className={`px-3.5 py-2 rounded-input text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      lansiaTab === "asam_kolesterol"
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-700 font-black"
                        : "bg-gray-50 border border-gray-100 text-saas-muted hover:bg-gray-100"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" /> Asam Urat & Kolesterol
                  </button>
                  <button
                    onClick={() => setLansiaTab("kemandirian")}
                    className={`px-3.5 py-2 rounded-input text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      lansiaTab === "kemandirian"
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-700 font-black"
                        : "bg-gray-50 border border-gray-100 text-saas-muted hover:bg-gray-100"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" /> Tingkat Kemandirian (AKS)
                  </button>
                </div>

                {/* Subtab: Tekanan Darah */}
                {lansiaTab === "tensi" && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs">
                      <p className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                        <InfoIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                        Klasifikasi Tekanan Darah (Pedoman JNC / Kemenkes RI)
                      </p>
                      <p className="text-indigo-800 text-[11px] font-semibold mt-1">
                        Pemeriksaan tensi dilakukan setelah lansia beristirahat minimal 5 menit dalam posisi duduk santai dan tidak mengobrol.
                      </p>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 text-saas-dark font-extrabold border-b border-gray-200">
                          <tr>
                            <th className="py-2.5 px-4">Kategori</th>
                            <th className="py-2.5 px-3">Sistol (mmHg)</th>
                            <th className="py-2.5 px-3">Diastol (mmHg)</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-4">Tindakan / Rekomendasi Kader</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-semibold text-saas-dark">
                          <tr className="hover:bg-emerald-50/30">
                            <td className="py-2.5 px-4 font-bold">Optimal / Normal</td>
                            <td className="py-2.5 px-3 text-emerald-700 font-bold">&lt; 120</td>
                            <td className="py-2.5 px-3 text-emerald-700 font-bold">&lt; 80</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Normal
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-[11px] text-saas-muted">
                              Pertahankan pola makan bergizi seimbang dan aktivitas fisik ringan rutin (jalan santai).
                            </td>
                          </tr>
                          <tr className="hover:bg-amber-50/30">
                            <td className="py-2.5 px-4 font-bold">Pra-Hipertensi</td>
                            <td className="py-2.5 px-3 text-amber-700 font-bold">120 – 139</td>
                            <td className="py-2.5 px-3 text-amber-700 font-bold">80 – 89</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Waspada
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-[11px] text-saas-muted">
                              Edukasi pengurangan konsumsi garam (maksimal 1 sendok teh/hari) dan kontrol ulang bulan depan.
                            </td>
                          </tr>
                          <tr className="hover:bg-orange-50/30">
                            <td className="py-2.5 px-4 font-bold">Hipertensi Derajat 1</td>
                            <td className="py-2.5 px-3 text-orange-700 font-bold">140 – 159</td>
                            <td className="py-2.5 px-3 text-orange-700 font-bold">90 – 99</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                                Hipertensi 1
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-[11px] text-saas-muted">
                              Anjurkan periksa ke dokter Puskesmas untuk evaluasi pengobatan dan modifikasi pola hidup.
                            </td>
                          </tr>
                          <tr className="hover:bg-red-50/30">
                            <td className="py-2.5 px-4 font-bold">Hipertensi Derajat 2</td>
                            <td className="py-2.5 px-3 text-red-700 font-bold">≥ 160</td>
                            <td className="py-2.5 px-3 text-red-700 font-bold">≥ 100</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                                Hipertensi 2
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-[11px] text-saas-muted">
                              Wajib kontrol rutin ke Puskesmas dan patuh minum obat anti-hipertensi dari dokter.
                            </td>
                          </tr>
                          <tr className="hover:bg-rose-100/40 bg-rose-50/20">
                            <td className="py-2.5 px-4 font-bold text-rose-800">Krisis Hipertensi</td>
                            <td className="py-2.5 px-3 text-rose-800 font-extrabold">&gt; 180</td>
                            <td className="py-2.5 px-3 text-rose-800 font-extrabold">&gt; 120</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                                Darurat!
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-[11px] text-rose-900 font-bold">
                              BAHAYA. Segera dampingi lansia ke Puskesmas / IGD terdekat jika disertai pusing berat, mual, atau pandangan kabur!
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Subtab: Gula Darah */}
                {lansiaTab === "gula" && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs">
                      <p className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                        <InfoIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                        Acuan Nilai Gula Darah Lansia (Kemenkes RI)
                      </p>
                      <p className="text-indigo-800 text-[11px] font-semibold mt-1">
                        Pemeriksaan di Posyandu umumnya menggunakan tes Gula Darah Sewaktu (GDS) tanpa puasa.
                      </p>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 text-saas-dark font-extrabold border-b border-gray-200">
                          <tr>
                            <th className="py-2.5 px-4">Jenis Pemeriksaan</th>
                            <th className="py-2.5 px-3 text-emerald-700">Normal</th>
                            <th className="py-2.5 px-3 text-amber-700">Pra-Diabetes (Waspada)</th>
                            <th className="py-2.5 px-3 text-red-700">Diabetes (Tinggi)</th>
                            <th className="py-2.5 px-4">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-semibold text-saas-dark">
                          <tr className="hover:bg-gray-50/60">
                            <td className="py-3 px-4 font-bold">
                              GDS (Gula Darah Sewaktu)
                              <span className="block text-[10px] text-saas-muted font-normal">Diperiksa kapan saja tanpa puasa</span>
                            </td>
                            <td className="py-3 px-3 text-emerald-700 font-bold">&lt; 140 mg/dL</td>
                            <td className="py-3 px-3 text-amber-700 font-bold">140 – 199 mg/dL</td>
                            <td className="py-3 px-3 text-red-700 font-bold">≥ 200 mg/dL</td>
                            <td className="py-3 px-4 text-[11px] text-saas-muted">
                              Jika ≥ 200 mg/dL disertai sering haus/kencing, sarankan periksa lanjut ke dokter.
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50/60">
                            <td className="py-3 px-4 font-bold">
                              GDP (Gula Darah Puasa)
                              <span className="block text-[10px] text-saas-muted font-normal">Puasa makan 8–10 jam sebelum tes</span>
                            </td>
                            <td className="py-3 px-3 text-emerald-700 font-bold">70 – 99 mg/dL</td>
                            <td className="py-3 px-3 text-amber-700 font-bold">100 – 125 mg/dL</td>
                            <td className="py-3 px-3 text-red-700 font-bold">≥ 126 mg/dL</td>
                            <td className="py-3 px-4 text-[11px] text-saas-muted">
                              Umumnya dilakukan pada pemeriksaan berkala di fasilitas kesehatan / Puskesmas.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Subtab: Asam Urat & Kolesterol */}
                {lansiaTab === "asam_kolesterol" && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs">
                      <p className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                        <InfoIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                        Acuan Nilai Asam Urat & Kolesterol Total
                      </p>
                      <p className="text-indigo-800 text-[11px] font-semibold mt-1">
                        Pemeriksaan laboratorium sederhana dengan strip darah kapiler pada posyandu lansia.
                      </p>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 text-saas-dark font-extrabold border-b border-gray-200">
                          <tr>
                            <th className="py-2.5 px-4">Parameter</th>
                            <th className="py-2.5 px-3 text-emerald-700">Target Normal</th>
                            <th className="py-2.5 px-3 text-red-700">Kadar Tinggi</th>
                            <th className="py-2.5 px-4">Edukasi Makanan & Pola Hidup</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-semibold text-saas-dark">
                          <tr className="hover:bg-gray-50/60">
                            <td className="py-2.5 px-4 font-bold">Asam Urat Laki-laki</td>
                            <td className="py-2.5 px-3 text-emerald-700 font-bold">3.4 – 7.0 mg/dL</td>
                            <td className="py-2.5 px-3 text-red-700 font-bold">&gt; 7.0 mg/dL</td>
                            <td className="py-2.5 px-4 text-[11px] text-saas-muted">
                              Batasi jeroan, emping, kangkung, bayam, dan kacang berlebih. Perbanyak minum air putih.
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50/60">
                            <td className="py-2.5 px-4 font-bold">Asam Urat Perempuan</td>
                            <td className="py-2.5 px-3 text-emerald-700 font-bold">2.4 – 6.0 mg/dL</td>
                            <td className="py-2.5 px-3 text-red-700 font-bold">&gt; 6.0 mg/dL</td>
                            <td className="py-2.5 px-4 text-[11px] text-saas-muted">
                              Batasi konsumsi makanan tinggi purin (seafood, jeroan) dan hindari minuman manis berfruktosa.
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50/60">
                            <td className="py-2.5 px-4 font-bold">Kolesterol Total</td>
                            <td className="py-2.5 px-3 text-emerald-700 font-bold">&lt; 200 mg/dL</td>
                            <td className="py-2.5 px-3 text-red-700 font-bold">
                              ≥ 240 mg/dL
                              <span className="block text-[10px] text-amber-700 font-normal">Batas: 200–239</span>
                            </td>
                            <td className="py-2.5 px-4 text-[11px] text-saas-muted">
                              Kurangi makanan bersantan kental, gorengan minyak berulang, dan lemak hewani. Perbanyak serat buah & oat.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Subtab: Kemandirian */}
                {lansiaTab === "kemandirian" && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs">
                      <p className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                        <InfoIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                        Tingkat Kemandirian Lansia (Indeks Barthel / AKS)
                      </p>
                      <p className="text-indigo-800 text-[11px] font-semibold mt-1">
                        Digunakan untuk menilai kemampuan fungsional lansia dalam memenuhi 10 kebutuhan dasar sehari-hari.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                          Kategori A
                        </span>
                        <h4 className="font-extrabold text-sm text-emerald-950">Mandiri (Skor 20)</h4>
                        <p className="text-[11px] text-emerald-800 leading-relaxed font-semibold">
                          Lansia dapat makan, mandi, berpakaian, buang air, dan berjalan secara mandiri tanpa memerlukan bantuan orang lain.
                        </p>
                      </div>

                      <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                          Kategori B
                        </span>
                        <h4 className="font-extrabold text-sm text-amber-950">Ketergantungan Sebagian (Skor 5 – 19)</h4>
                        <p className="text-[11px] text-amber-800 leading-relaxed font-semibold">
                          Lansia memerlukan sedikit bantuan, pendampingan, atau pengawasan keluarga untuk beberapa aktivitas harian.
                        </p>
                      </div>

                      <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                          Kategori C
                        </span>
                        <h4 className="font-extrabold text-sm text-rose-950">Ketergantungan Total (Skor 0 – 4)</h4>
                        <p className="text-[11px] text-rose-800 leading-relaxed font-semibold">
                          Lansia tirah baring penuh dan bergantung total pada pendamping/keluarga. Disarankan program kunjungan rumah (home visit).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Urutan Kegiatan Pelayanan Posyandu (Hari-H) */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4.5 h-4.5 text-saas-primary" />
              <h3 className="font-extrabold text-sm text-saas-dark">Alur 5 Langkah Pelayanan Posyandu (Hari-H)</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 text-xs font-semibold leading-normal pt-2">
              {[
                { step: "1", title: "Pendaftaran", desc: "Cari nama warga atau daftarkan jika baru pertama datang." },
                { step: "2", title: "Penimbangan & Ukur", desc: "Timbang BB, ukur TB balita, atau ukur tensi lansia." },
                { step: "3", title: "Pencatatan", desc: "Ketik hasil ukur langsung ke formulir menu Pelayanan." },
                { step: "4", title: "Penyuluhan & PMT", desc: "Beri konseling gizi, kapsul Vit A / obat cacing, & PMT." },
                { step: "5", title: "Rujukan & Selesai", desc: "Laporkan ke Bidan bila ada kasus gizi buruk / tensi darurat." },
              ].map((s) => (
                <div key={s.step} className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-1 relative">
                  <div className="absolute top-2.5 right-3 text-[10px] font-black text-saas-primary bg-saas-primary/10 w-5 h-5 rounded-full flex items-center justify-center">
                    {s.step}
                  </div>
                  <p className="font-extrabold text-saas-dark pr-6">{s.title}</p>
                  <p className="text-[11px] text-saas-muted leading-relaxed font-semibold mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tanya Jawab Umum (FAQ / Troubleshooting) */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-saas-primary flex items-center justify-center">
                  <HelpCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-saas-dark">Tanya Jawab Seputar Posyandu (FAQ)</h3>
                  <p className="text-[11px] text-saas-muted">Jawaban cepat untuk kendala yang sering ditanyakan kader</p>
                </div>
              </div>

              {/* FAQ Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(["Semua", "Balita", "Lansia", "Akun & Keamanan", "Umum"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFaqFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      faqFilter === cat
                        ? "bg-saas-primary text-white shadow-xs"
                        : "bg-gray-100 text-saas-muted hover:text-saas-dark"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="border border-gray-100 rounded-xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        className="w-full p-4 text-left flex items-center justify-between gap-4 bg-gray-50/50 hover:bg-teal-50/20 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-teal-100 text-teal-800 shrink-0">
                            {faq.category}
                          </span>
                          <span className="font-bold text-xs text-saas-dark">{faq.question}</span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-saas-primary shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-saas-muted shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="p-4 bg-white text-xs text-saas-muted font-semibold leading-relaxed border-t border-gray-100">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-saas-muted font-medium">
                  Tidak ditemukan pertanyaan yang cocok dengan pencarian "{searchQuery}".
                </div>
              )}
            </div>
          </div>

          {/* Kamus Istilah Posyandu & Kontak Dukungan Rujukan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kamus Istilah */}
            <div className="lg:col-span-2 bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <InfoIcon className="w-4.5 h-4.5 text-saas-primary" />
                  <h3 className="font-extrabold text-sm text-saas-dark">Kamus Istilah Posyandu (Istilah Penting)</h3>
                </div>
                <span className="text-[10px] font-bold text-saas-muted">
                  {filteredGlossary.length} Istilah
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {filteredGlossary.map((g, idx) => (
                  <div key={idx} className="p-3 bg-gray-50/80 border border-gray-100 rounded-xl space-y-1 hover:border-teal-200 transition-colors">
                    <p className="font-extrabold text-saas-dark text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                      {g.istilah}
                    </p>
                    <p className="text-[10px] text-saas-muted leading-normal font-semibold pl-3">{g.arti}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kontak Pengembang & Dukungan Teknis */}
            <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4.5 h-4.5 text-saas-primary" />
                  <h3 className="font-extrabold text-sm text-saas-dark">Kontak Pengembang (Developer)</h3>
                </div>
                <p className="text-[11px] text-saas-muted font-medium leading-normal">
                  Bila Anda mengalami kendala teknis, error sistem, atau membutuhkan bantuan penggunaan aplikasi SIPANDU, silakan hubungi pengembang:
                </p>
                
                <div className="space-y-3 pt-1">
                  <div className="p-3.5 bg-teal-50/50 border border-teal-100/60 rounded-xl space-y-1">
                    <p className="text-[9px] text-saas-primary font-bold uppercase tracking-wider">
                      Tim Pengembang Sistem • Pengabdian Masyarakat
                    </p>
                    <p className="text-xs font-black text-saas-dark">Developer SIPANDU</p>
                    <a
                      href="https://wa.me/6285877925025?text=Halo%20Developer%20SIPANDU,%20saya%20memerlukan%20bantuan%20terkait%20aplikasi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-saas-primary font-bold hover:underline inline-flex items-center gap-1 pt-1"
                    >
                      💬 +62 858-7792-5025 (WhatsApp Developer)
                    </a>
                  </div>

                  <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                    <p className="text-[9px] text-saas-muted font-bold uppercase tracking-wider">Dukungan Teknis &amp; Konsultasi</p>
                    <p className="text-xs font-black text-saas-dark">Layanan Pemeliharaan Sistem</p>
                    <p className="text-[11px] text-saas-muted font-semibold pt-0.5">
                      Siap membantu troubleshooting, sinkronisasi data, &amp; panduan teknis kader.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] text-saas-muted font-medium leading-relaxed">
                  💡 <strong>Info Pengembang:</strong> Anda dapat mengganti nomor WhatsApp di atas dengan nomor pribadi/tim pengembang Anda kapan saja.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
