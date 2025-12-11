'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import './PokemonCard.css'

interface PokemonCardProps {
  pokemon: {
    id: number
    name: string
    image: string
    types: string[]
  }
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUserAndFavorites()
  }, [])

  async function checkUserAndFavorites() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('pokemon_id', pokemon.id)
        .single()

      setIsFavorite(!!data)
    }
  }

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!user) {
      alert('Faça login para favoritar pokémons!')
      return
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('pokemon_id', pokemon.id)
        setIsFavorite(false)
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            pokemon_id: pokemon.id,
            pokemon_name: pokemon.name
          })
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  return (
    <div className="pokeCard">
      <img 
        src={pokemon.image} 
        alt={pokemon.name}
        className="pokemon-image"
        onError={(e) => {
          e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
        }}
      />
      
      <div className="pokemon-name">{pokemon.name}</div>
      <div className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</div>
      
      <button
        onClick={toggleFavorite}
        className="favorite-btn"
        title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        {isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  )
}