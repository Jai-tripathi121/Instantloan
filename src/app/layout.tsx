import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InstantLoan — Loan Eligibility, Zero CIBIL Impact",
  description: "60 seconds mein 33 banks mein loan eligibility check karo. CIBIL impact nahi. Data safe. Sirf ₹99 AI report.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
