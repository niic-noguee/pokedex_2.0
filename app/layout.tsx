import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pokédex',
  description: 'Explore e favorite seus Pokémons favoritos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/pokeball.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}