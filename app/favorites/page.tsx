'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import PokemonCard from '@/components/PokemonCard'
import './Favorites.css'

interface FavoritePokemon {
  id: string
  pokemon_id: number
  pokemon_name: string
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoritePokemon[]>([])
  const [pokemonDetails, setPokemonDetails] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserAndFavorites()
  }, [])

  async function checkUserAndFavorites() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (!user) {
      setLoading(false)
      return
    }

    const { data: favoritesData, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('pokemon_id', { ascending: true })

    if (error) {
      console.error('Erro ao buscar favoritos:', error)
      setLoading(false)
      return
    }

    setFavorites(favoritesData || [])

    if (favoritesData && favoritesData.length > 0) {
      fetchPokemonDetails(favoritesData)
    } else {
      setLoading(false)
    }
  }

  async function fetchPokemonDetails(favs: FavoritePokemon[]) {
    try {
      const promises = favs.map(async (fav) => {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${fav.pokemon_id}`)
          if (!response.ok) return null
          
          const data = await response.json()
          return {
            id: data.id,
            name: data.name,
            image: data.sprites.front_default,
            types: data.types.map((t: any) => t.type.name)
          }
        } catch (error) {
          console.error(`Erro ao buscar Pokémon ${fav.pokemon_id}:`, error)
          return null
        }
      })

      const results = await Promise.all(promises)
      const validResults = results.filter(Boolean)
      setPokemonDetails(validResults)
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromFavorites = async (pokemonId: number) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('pokemon_id', pokemonId)

      if (!error) {
        setFavorites(favorites.filter(fav => fav.pokemon_id !== pokemonId))
        setPokemonDetails(pokemonDetails.filter(pokemon => pokemon.id !== pokemonId))
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
    }
  }

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading">Carregando seus favoritos...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="favorites-container">
        <div className="not-logged-in">
          <h2>❌ Acesso Restrito</h2>
          <p>Você precisa estar logado para ver seus favoritos.</p>
          <div className="auth-buttons">
            <Link href="/login" className="auth-btn login-btn">
              Fazer Login
            </Link>
            <Link href="/" className="auth-btn back-btn">
              Voltar para Pokédex
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <Link href="/" className="back-button">
          ← Voltar para Pokédex
        </Link>
        
        <h1 className="page-title">❤️ Meus Favoritos</h1>
        
        {user && (
          <div className="user-info">
            <span>Olá, <strong>{user.email?.split('@')[0]}</strong></span>
            <span className="favorites-count">
              {favorites.length} Pokémon{favorites.length !== 1 ? 's' : ''} favoritado{favorites.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-icon">🤍</div>
          <h2>Nenhum Pokémon favoritado ainda</h2>
          <p>Explore a Pokédex e clique no coração para adicionar seus favoritos!</p>
          <Link href="/" className="explore-btn">
            Explorar Pokémons
          </Link>
        </div>
      ) : (
        <>
          <div className="favorites-grid">
            {pokemonDetails.map((pokemon) => (
              <div key={pokemon.id} className="favorite-item">
                <PokemonCard pokemon={pokemon} />
                <button
                  onClick={() => removeFromFavorites(pokemon.id)}
                  className="remove-btn"
                  title="Remover dos favoritos"
                >
                  ❌ Remover
                </button>
              </div>
            ))}
          </div>

          <div className="favorites-stats">
            <div className="stat-card">
              <span className="stat-number">{favorites.length}</span>
              <span className="stat-label">Total de Favoritos</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {pokemonDetails.length > 0 
                  ? Math.round((pokemonDetails.length / 151) * 100) // 151 pokémons da 1ª geração
                  : 0}%
              </span>
              <span className="stat-label">da 1ª Geração</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}