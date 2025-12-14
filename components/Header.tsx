'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import './Header.css'

interface HeaderProps {
  onSearch?: (searchTerm: string) => void
}

export default function Header({ onSearch }: HeaderProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    
    // Escutar mudanças no estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="header">
      <div className="header-top">
        <Link href="/" className="logo-link">
          <h1 className="page-title">Pokédex</h1>
        </Link>
        
        <div className="header-actions">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/favorites" className="favorites-link">
                    ❤️ Meus Favoritos
                  </Link>
                  <div className="user-greeting">
                    Olá, <strong>{user.email?.split('@')[0]}</strong>
                  </div>
                  <button onClick={handleLogout} className="logout-btn">
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="login-link">
                    Entrar
                  </Link>
                  <Link href="/register" className="register-link">
                    Cadastrar
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="search-bar">
        <input 
          type="text" 
          id="searchInput" 
          placeholder="Buscar pokémon"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button id="searchButton" onClick={handleSearch}>
          🔍
        </button>
      </div>
    </header>
  )
}