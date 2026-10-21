import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./polaris.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "POLARIS | AI Energy Autonomy for Polar Research Stations",
  description: "Load forecasting, anomaly alerts and diesel dispatch optimisation for Bharati, Maitri and Himadri research stations.",
  keywords: ["polar energy", "AI forecasting", "research station", "renewable energy", "antarctic"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-slate-900">{children}</body>
    </html>
  );
}
