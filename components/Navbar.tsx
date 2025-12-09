'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, Heart, LogIn, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  // Verificar se usuário está logado
  useEffect(() => {
    checkUser()
    
    // Ouvir mudanças no login
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="bg-red-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Home size={24} />
          <span className="text-xl font-bold">Pokedex</span>
        </Link>
        
        {/* Links de navegação */}
        <div className="flex items-center space-x-6">
          <Link 
            href="/pokemons" 
            className="flex items-center space-x-1 hover:text-yellow-300 transition-colors"
          >
            <Home size={20} />
            <span>Pokémons</span>
          </Link>
          
          <Link 
            href="/favorites" 
            className="flex items-center space-x-1 hover:text-yellow-300 transition-colors"
          >
            <Heart size={20} />
            <span>Favoritos</span>
          </Link>
          
          {/* Se o usuário NÃO está logado */}
          {!user ? (
            <Link 
              href="/login" 
              className="flex items-center space-x-1 hover:text-yellow-300 transition-colors"
            >
              <LogIn size={20} />
              <span>Entrar</span>
            </Link>
          ) : (
            /* Se o usuário ESTÁ logado */
            <div className="flex items-center space-x-4">
              <span className="text-sm">Olá, {user.email?.split('@')[0]}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 hover:text-yellow-300 transition-colors"
              >
                <LogOut size={20} />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}