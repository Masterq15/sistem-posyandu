import nodemailer from 'nodemailer';

interface SendResetEmailOptions {
  to: string;
  nama: string;
  resetUrl: string;
}

/**
 * Creates nodemailer transporter if SMTP environment variables exist.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Kirim email reset password.
 * Jika SMTP belum dikonfigurasi, link reset password akan ditampilkan di konsol server (dev mode).
 */
export async function sendResetPasswordEmail({ to, nama, resetUrl }: SendResetEmailOptions): Promise<boolean> {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || '"SIPANDU" <noreply@sipandu.id>';

  const subject = 'Atur Ulang Kata Sandi - SIPANDU';

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Atur Ulang Kata Sandi</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .logo { font-size: 20px; font-weight: 800; color: #0d9488; text-decoration: none; margin-bottom: 24px; display: inline-block; }
        h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; }
        p { font-size: 14px; line-height: 1.6; color: #475569; }
        .btn { display: inline-block; margin: 24px 0; padding: 14px 28px; background-color: #0d9488; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 9999px; box-shadow: 0 2px 6px rgba(13, 148, 136, 0.3); }
        .footer { margin-top: 32px; padding-top: 16px; border-t: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; }
        .token-box { background-color: #f1f5f9; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; color: #334155; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🌿 SIPANDU - Sistem Informasi Pelayanan dan Data Posyandu</div>
        <h1>Atur Ulang Kata Sandi</h1>
        <p>Halo <strong>${nama}</strong>,</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Kader SIPANDU Anda. Silakan klik tombol di bawah ini untuk melanjutkan:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="btn" target="_blank">Atur Ulang Kata Sandi Saya</a>
        </div>

        <p>Jika tombol di atas tidak dapat diklik, salin dan tempel tautan berikut di browser Anda:</p>
        <div class="token-box">${resetUrl}</div>

        <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
          ⏰ Tautan ini berlaku selama <strong>1 jam</strong>. Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini dan kata sandi Anda tidak akan berubah.
        </p>

        <div class="footer">
          &copy; 2026 SIPANDU - Sistem Informasi Pelayanan dan Data Posyandu.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log('\n============== [RESET PASSWORD EMAIL (DEV MODE)] ==============');
    console.log(`Kepada  : ${to}`);
    console.log(`Subjek  : ${subject}`);
    console.log(`Tautan  : ${resetUrl}`);
    console.log('=================================================================\n');
    return true;
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Gagal mengirim email reset password via SMTP:', error);
    return false;
  }
}

interface SendPosyanduReminderOptions {
  to: string;
  namaKader: string;
  namaPosyandu: string;
  tanggalJadwal: string;
  lokasi: string;
  pesanKhusus?: string;
}

/**
 * Kirim email pengingat kegiatan Posyandu bulanan (HTML template)
 */
export async function sendPosyanduReminderEmail({
  to,
  namaKader,
  namaPosyandu,
  tanggalJadwal,
  lokasi,
  pesanKhusus,
}: SendPosyanduReminderOptions): Promise<boolean> {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || '"SIPANDU" <noreply@sipandu.id>';
  const subject = `📅 Pengingat Kegiatan Posyandu - ${namaPosyandu}`;

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .header { display: flex; align-items: center; justify-content: space-between; border-b: 1px solid #f1f5f9; pb: 16px; margin-bottom: 20px; }
        .logo { font-size: 22px; font-weight: 800; color: #14b8a6; }
        .badge { background-color: #ccfbf1; color: #0d9488; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 9999px; }
        h2 { font-size: 20px; color: #0f172a; margin-top: 0; }
        .card { background-color: #f7f8fa; border-radius: 12px; padding: 20px; border-left: 4px solid #14b8a6; margin: 20px 0; }
        .info-row { margin-bottom: 10px; font-size: 14px; }
        .info-label { font-weight: 600; color: #64748b; display: inline-block; width: 130px; }
        .info-val { color: #0f172a; font-weight: 700; }
        .footer { margin-top: 30px; pt: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🌿 SIPANDU <span class="badge">JADWAL POSYANDU</span></div>
        <h2>Pengingat Jadwal Kegiatan Posyandu</h2>
        <p>Halo Kader <strong>${namaKader}</strong>,</p>
        <p>Email ini dikirimkan secara otomatis oleh sistem untuk mengingatkan pelaksanaan kegiatan Posyandu rutin mendatang:</p>

        <div class="card">
          <div class="info-row">
            <span class="info-label">Nama Posyandu:</span>
            <span class="info-val">${namaPosyandu}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tanggal Pelaksanaan:</span>
            <span class="info-val">${tanggalJadwal}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Lokasi:</span>
            <span class="info-val">${lokasi}</span>
          </div>
          ${
            pesanKhusus
              ? `<div class="info-row"><span class="info-label">Catatan Tambahan:</span><span class="info-val">${pesanKhusus}</span></div>`
              : ''
          }
        </div>

        <p>Mohon mempersiapkan alat penimbangan, pita LiLA, media KMS, serta buku registrasi Balita & Lansia sebelum acara dimulai.</p>
        
        <div class="footer">
          &copy; 2026 SIPANDU - Sistem Informasi Pelayanan dan Data Posyandu.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`\n========== [POSYANDU REMINDER EMAIL (DEV LOG)] ==========`);
    console.log(`Kepada  : ${to}`);
    console.log(`Posyandu: ${namaPosyandu}`);
    console.log(`Jadwal  : ${tanggalJadwal}`);
    console.log(`==========================================================\n`);
    return true;
  }

  try {
    await transporter.sendMail({ from, to, subject, html });
    return true;
  } catch (error) {
    console.error('Gagal mengirim email pengingat Posyandu:', error);
    return false;
  }
}

