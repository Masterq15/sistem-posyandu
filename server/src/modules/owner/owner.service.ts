import prisma from '../../shared/config/prisma';
import bcrypt from 'bcryptjs';
import { auditLogService } from '../auditLog/auditLog.service';

export const ownerService = {
  /**
   * Ekspor & Backup Data Sistem Posyandu (.json dump)
   */
  async exportBackupData(posyanduId: string, kaderId?: string, kaderNama?: string) {
    const posyandu = await prisma.posyandu.findUnique({
      where: { id: posyanduId },
      include: {
        kaders: {
          select: { id: true, nama: true, email: true, role: true, isActive: true, createdAt: true },
        },
        balitas: {
          include: { pemeriksaans: true },
        },
        lansias: {
          include: { pemeriksaans: true },
        },
        notifications: true,
      },
    });

    if (!posyandu) {
      throw new Error('Posyandu tidak ditemukan');
    }

    // Record Audit Log
    await auditLogService.createLog({
      posyanduId,
      kaderId,
      kaderNama,
      action: 'BACKUP_DATA',
      details: `Ekspor backup data sistem Posyandu ${posyandu.nama} (.json dump)`,
    });

    const backupPayload = {
      meta: {
        appName: 'SIPANDU',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        posyanduId: posyandu.id,
        posyanduNama: posyandu.nama,
      },
      data: posyandu,
    };

    return backupPayload;
  },

  /**
   * Ambil Audit Log aktivitas posyandu
   */
  async getAuditLogs(posyanduId: string) {
    return auditLogService.getLogs(posyanduId, 100);
  },

  /**
   * Reset Semua Data Pasien & Pemeriksaan Posyandu (Fitur Destruktif Khusus Owner)
   * Memerlukan verifikasi ganda: Teks Konfirmasi + Password Owner
   */
  async resetPosyanduData(params: {
    posyanduId: string;
    ownerKaderId: string;
    ownerNama: string;
    passwordInput: string;
    confirmText: string;
    ipAddress?: string;
  }) {
    const { posyanduId, ownerKaderId, ownerNama, passwordInput, confirmText, ipAddress } = params;

    // 1. Verifikasi Teks Konfirmasi
    if (confirmText !== 'RESET POSYANDU PERMANEN') {
      throw new Error("Teks konfirmasi salah. Harap ketik 'RESET POSYANDU PERMANEN'.");
    }

    // 2. Verifikasi Password Owner
    const ownerKader = await prisma.kader.findUnique({
      where: { id: ownerKaderId },
    });

    if (!ownerKader || ownerKader.role !== 'OWNER') {
      throw new Error('Hanya pengguna dengan role OWNER yang diizinkan melakukan reset data.');
    }

    const isPasswordValid = await bcrypt.compare(passwordInput, ownerKader.password);
    if (!isPasswordValid) {
      throw new Error('Password Owner yang dimasukkan tidak valid.');
    }

    // 3. Eksekusi Hapus Data Terstruktur dalam Transaksi
    await prisma.$transaction([
      prisma.pemeriksaanBalita.deleteMany({ where: { balita: { posyanduId } } }),
      prisma.balita.deleteMany({ where: { posyanduId } }),
      prisma.pemeriksaanLansia.deleteMany({ where: { lansia: { posyanduId } } }),
      prisma.lansia.deleteMany({ where: { posyanduId } }),
      prisma.notification.deleteMany({ where: { posyanduId } }),
    ]);

    // 4. Catat Log Audit Destruktif
    await auditLogService.createLog({
      posyanduId,
      kaderId: ownerKaderId,
      kaderNama: ownerNama,
      action: 'RESET_POSYANDU',
      details: `[DESTRUKTIF] Owner mereset semua data balita, lansia, dan pemeriksaan Posyandu ${posyanduId}`,
      ipAddress,
    });

    return { success: true, message: 'Semua data Posyandu telah berhasil direset secara permanen.' };
  },
};
