import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const jackInput = localFont({
  src: "../../public/fonts/JackInput.ttf",
  variable: "--font-jack",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "InstantLoan — Loan Eligibility, Zero CIBIL Impact",
  description: "Check loan eligibility across 33 banks in 60 seconds. Zero CIBIL impact. Data stays on your device. ₹99 AI report.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jackInput.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
