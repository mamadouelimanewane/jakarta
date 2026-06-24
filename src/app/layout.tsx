import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "J@KARTA - Plateforme Moto-Taxis Sénégal",
  description: "Connecter les conducteurs, simplifier les trajets, transformer les vies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>{children}</body>
    </html>
  );
}
