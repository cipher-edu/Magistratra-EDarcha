import type { Metadata } from "next";
import { Literata, Manrope } from "next/font/google";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const serif = Literata({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Magistratura boshqaruv tizimi",
  description: "Talaba va admin profili",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" data-theme="dark">
      <body className={`${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
