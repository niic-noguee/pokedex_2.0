import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pokedex 2.0',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50`}>
        <Navbar />
        <main>
          {children}
        </main>
        
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg">Pokedex 2.0</p>
            <p className="text-gray-400 mt-2">
              Por Nicolly Nogueira
            </p>
            <div className="mt-4 text-sm text-gray-400">
              <p>Dados de Pokémon fornecidos pela <a href="https://pokeapi.co" className="text-blue-300 hover:underline">PokeAPI</a></p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}