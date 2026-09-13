import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { FontSizeProvider } from "../contexts/FontSizeContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import HelmetClientProvider from "../components/HelmetClientProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIPANDU - Sistem Informasi Pelayanan dan Data Posyandu",
  description: "Digitalisasi Pencatatan Tumbuh Kembang Anak & Pelayanan Lansia Mandiri — SIPANDU",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={`${plusJakartaSans.variable} font-sans h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('posyandu_theme_preference');
                var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-canvas text-saas-dark dark:bg-[#0B0F19] dark:text-slate-100 flex flex-col transition-colors duration-200">
        <HelmetClientProvider>
          <ThemeProvider>
            <FontSizeProvider>
              <AuthProvider>{children}</AuthProvider>
            </FontSizeProvider>
          </ThemeProvider>
        </HelmetClientProvider>
      </body>
    </html>
  );
}
