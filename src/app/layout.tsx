import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Facture Cat 🐱",
  description: "Application de comptabilité intelligente",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex h-screen overflow-hidden bg-brand-beige">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-brand-off-white">
          {children}
        </main>
      </body>
    </html>
  );
}
