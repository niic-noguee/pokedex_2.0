'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
  const [loading, setLoading] = useState(false)

  // Verificar usuário e favoritos
  useEffect(() => {
    checkUserAndFavorites()
  }, [])

  async function checkUserAndFavorites() {
    // Verificar usuário
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    // Se tiver usuário, verificar se Pokémon é favorito
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

  const toggleFavorite = async () => {
    if (!user) {
      alert('⚠️ Faça login para favoritar pokémons!')
      return
    }

    setLoading(true)

    try {
      if (isFavorite) {
        // REMOVER dos favoritos
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('pokemon_id', pokemon.id)

        if (!error) {
          setIsFavorite(false)
          console.log('❌ Removido dos favoritos')
        }
      } else {
        // ADICIONAR aos favoritos
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            pokemon_id: pokemon.id,
            pokemon_name: pokemon.name
          })

        if (!error) {
          setIsFavorite(true)
          console.log('✅ Adicionado aos favoritos')
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      {/* Imagem do Pokémon */}
      <div className="relative p-4 bg-gray-50">
        <img
          src={pokemon.image}
          alt={pokemon.name}
          className="w-full h-48 object-contain"
          onError={(e) => {
            // Se imagem não carregar, usa uma padrão
            e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
          }}
        />
        
        {/* Botão de Favorito */}
        <button
          onClick={toggleFavorite}
          disabled={loading}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
          title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart
            size={24}
            className={
              isFavorite 
                ? 'fill-red-500 text-red-500 animate-pulse' 
                : 'text-gray-300 hover:text-red-400'
            }
          />
        </button>
      </div>
      
      {/* Informações do Pokémon */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold capitalize text-gray-800">
              {pokemon.name}
            </h3>
            <p className="text-gray-500 text-sm">
              #{pokemon.id.toString().padStart(3, '0')}
            </p>
          </div>
        </div>
        
        {/* Tipos do Pokémon */}
        <div className="flex gap-2 mt-3">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className="px-3 py-1 rounded-full text-xs font-medium capitalize"
              style={{
                backgroundColor: getTypeColor(type),
                color: 'white'
              }}
            >
              {type}
            </span>
          ))}
        </div>

        {/* Status do botão */}
        <div className="mt-4 text-center">
          {!user ? (
            <p className="text-sm text-gray-500">Faça login para favoritar</p>
          ) : loading ? (
            <p className="text-sm text-blue-500">Processando...</p>
          ) : isFavorite ? (
            <p className="text-sm text-green-600">⭐ Nos seus favoritos!</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Função auxiliar para cores dos tipos
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  }
  
  return colors[type] || '#68A090' // Cor padrão
}