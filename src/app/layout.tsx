import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Facture Cat — Comptabilité TPE/PME',
  description: 'Application comptable intelligente pour TPE et PME françaises',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className} style={{ background: '#1a1a2e', color: '#e2e2f0' }}>
        {children}
      </body>
    </html>
  )
}
