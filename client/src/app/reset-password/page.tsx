"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import PageHelmet from "@/components/PageHelmet";

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      setIsValidToken(false);
      setTokenError("Tautan reset password tidak valid atau tidak ditemukan.");
      return;
    }

    const checkToken = async () => {
      try {
        await authApi.verifyResetToken(token);
        setIsValidToken(true);
      } catch (err: unknown) {
        setIsValidToken(false);
        setTokenError(
          err instanceof Error
            ? err.message
            : "Tautan reset password tidak valid atau telah kadaluarsa."
        );
      } finally {
        setIsVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword.length < 8) {
      setFormError("Kata sandi baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (!token) return;

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setIsSuccess(true);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Gagal memperbarui kata sandi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/40 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <PageHelmet
        title="Reset Kata Sandi"
        description="Atur ulang kata sandi akun kader SIPANDU Anda dengan aman."
      />
      {/* Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-saas-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s" }}
        />
      </div>

      <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 shadow-xl shadow-teal-900/5 border border-teal-100/30">
        {/* Header Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center p-1.5 shadow-2xs">
            <img src="/logo.svg" alt="Logo SIPANDU" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <span className="font-black text-teal-950 text-xl tracking-tight leading-none block">
              SIPANDU
            </span>
            <span className="text-[9px] text-teal-700 font-bold uppercase tracking-wider block mt-0.5">
              Sistem Informasi Pelayanan dan Data Posyandu
            </span>
          </div>
        </div>

        {/* Loading state */}
        {isVerifying && (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-saas-primary animate-spin" />
            <p className="text-sm font-medium text-slate-600">
              Memverifikasi tautan reset password...
            </p>
          </div>
        )}

        {/* Invalid token state */}
        {!isVerifying && !isValidToken && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Tautan Tidak Valid
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                {tokenError || "Tautan reset password sudah kadaluarsa atau pernah digunakan."}
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="w-full py-3 bg-saas-primary text-white text-sm font-bold rounded-pill hover:bg-saas-primary-active transition-all flex items-center justify-center gap-2 mt-4"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Login
            </button>
          </div>
        )}

        {/* Success state */}
        {!isVerifying && isValidToken && isSuccess && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-teal-950">
                Kata Sandi Berhasil Diperbarui!
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Kata sandi baru Anda telah tersimpan. Silakan masuk menggunakan kata sandi baru.
              </p>
            </div>
            <button
              id="btn-login-after-reset"
              onClick={() => router.push("/login")}
              className="w-full py-3.5 bg-saas-primary hover:bg-saas-primary-active text-white text-sm font-bold rounded-pill transition-all shadow-sm flex items-center justify-center gap-2 mt-4"
            >
              Masuk Sekarang
            </button>
          </div>
        )}

        {/* Reset form state */}
        {!isVerifying && isValidToken && !isSuccess && (
          <div>
            <div className="mb-6 text-center">
              <div className="w-12 h-12 bg-teal-50 text-saas-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-teal-950 tracking-tight">
                Atur Kata Sandi Baru
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Masukkan kata sandi baru minimal 8 karakter untuk akun Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-teal-950 mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="reset-new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full pl-10 pr-10 py-3 bg-white border border-hairline rounded-input text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-saas-primary focus:ring-2 focus:ring-saas-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-teal-950 mb-1.5">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="reset-confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full pl-10 pr-10 py-3 bg-white border border-hairline rounded-input text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-saas-primary focus:ring-2 focus:ring-saas-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-input text-xs text-red-700 font-semibold leading-relaxed">
                  ⚠️ {formError}
                </div>
              )}

              {/* Submit Button */}
              <button
                id="btn-reset-password-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-saas-primary hover:bg-saas-primary-active text-white text-sm font-bold rounded-pill transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan Kata Sandi...
                  </>
                ) : (
                  "Simpan Kata Sandi Baru"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-saas-primary animate-spin" />
        </div>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  );
}
