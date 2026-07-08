import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

// Self-hosted by Next at build time (no runtime request to Google Fonts, no
// render-blocking @import, no font-swap flash) and exposed as a CSS variable
// so both Tailwind utilities and the legacy globals.css rules share one font.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "AarogyaMitra — Your Health Scheme Guide",
  description:
    "Find free and subsidised hospital treatment you are legally entitled to under Ayushman Bharat, Aarogyasri & state schemes.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
