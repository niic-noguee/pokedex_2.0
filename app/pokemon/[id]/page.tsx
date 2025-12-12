'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import './PokemonDetails.css'

interface PokemonDetails {
  id: number
  name: string
  image: string
  types: { type: { name: string } }[]
  abilities: { ability: { name: string } }[]
  stats: { base_stat: number; stat: { name: string } }[]
  height: number
  weight: number
  species: { url: string }
}

interface EvolutionChain {
  name: string
  id: number
  image: string
}

export default function PokemonDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const pokemonId = params.id as string
  
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null)
  const [evolutions, setEvolutions] = useState<EvolutionChain[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar detalhes do Pokémon
  const fetchPokemonDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Buscar dados básicos do Pokémon
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
      if (!response.ok) throw new Error('Pokémon não encontrado')
      
      const data = await response.json()
      setPokemon(data)
      
      // Buscar cadeia de evolução
      await fetchEvolutionChain(data.species.url)
      
      // Verificar se é favorito
      await checkIfFavorite(data.id)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar Pokémon')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Buscar cadeia de evolução
  const fetchEvolutionChain = async (speciesUrl: string) => {
    try {
      const speciesResponse = await fetch(speciesUrl)
      const speciesData = await speciesResponse.json()
      
      const evolutionResponse = await fetch(speciesData.evolution_chain.url)
      const evolutionData = await evolutionResponse.json()
      
      const chain = extractEvolutionChain(evolutionData.chain)
      setEvolutions(chain)
    } catch (err) {
      console.error('Erro ao buscar evoluções:', err)
    }
  }

  // Extrair cadeia de evolução
  const extractEvolutionChain = (chain: any): EvolutionChain[] => {
    const evolutions: EvolutionChain[] = []
    
    const processChain = (node: any) => {
      if (node.species) {
        const id = node.species.url.split('/').filter(Boolean).pop()
        evolutions.push({
          name: node.species.name,
          id: parseInt(id),
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
        })
      }
      
      if (node.evolves_to && node.evolves_to.length > 0) {
        node.evolves_to.forEach(processChain)
      }
    }
    
    processChain(chain)
    return evolutions
  }

  // Verificar se usuário está logado e se Pokémon é favorito
  const checkIfFavorite = async (pokemonId: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('pokemon_id', pokemonId)
        .single()
      
      setIsFavorite(!!data)
    }
  }

  // Alternar favorito
  const toggleFavorite = async () => {
    if (!user) {
      alert('Faça login para favoritar pokémons!')
      router.push('/login')
      return
    }

    try {
      if (isFavorite) {
        // Remover dos favoritos
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('pokemon_id', pokemon?.id)
        setIsFavorite(false)
      } else {
        // Adicionar aos favoritos
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            pokemon_id: pokemon?.id,
            pokemon_name: pokemon?.name
          })
        setIsFavorite(true)
      }
    } catch (err) {
      console.error('Erro ao atualizar favoritos:', err)
      alert('Erro ao atualizar favoritos')
    }
  }

  // Cores para tipos de Pokémon
  const getTypeColor = (type: string) => {
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
    return colors[type] || '#68A090'
  }

  // Converter altura (decímetros para metros)
  const formatHeight = (height: number) => {
    return `${(height / 10).toFixed(1)} m`
  }

  // Converter peso (hectogramas para kg)
  const formatWeight = (weight: number) => {
    return `${(weight / 10).toFixed(1)} kg`
  }

  // Formatar nome de estatística
  const formatStatName = (name: string) => {
    const statNames: Record<string, string> = {
      'hp': 'HP',
      'attack': 'Ataque',
      'defense': 'Defesa',
      'special-attack': 'Ataque Especial',
      'special-defense': 'Defesa Especial',
      'speed': 'Velocidade'
    }
    return statNames[name] || name
  }

  useEffect(() => {
    if (pokemonId) {
      fetchPokemonDetails()
    }
  }, [pokemonId])

  if (loading) {
    return (
      <div className="details-container">
        <div className="loading">Carregando detalhes do Pokémon...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="details-container">
        <div className="error">
          <p>{error}</p>
          <Link href="/" className="back-button">
            Voltar para Pokédex
          </Link>
        </div>
      </div>
    )
  }

  if (!pokemon) {
    return (
      <div className="details-container">
        <div className="error">
          <p>Pokémon não encontrado</p>
          <Link href="/" className="back-button">
            Voltar para Pokédex
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="details-container">
      <Link href="/" className="back-button">
        ← Voltar para Pokédex
      </Link>

      <div className="pokemon-details-card">
        {/* Cabeçalho com imagem e informações básicas */}
        <div className="pokemon-header">
          <img
            src={pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
            alt={pokemon.name}
            className="pokemon-image-large"
            onError={(e) => {
              e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png`
            }}
          />
          
          <div className="pokemon-info">
            <h1 className="pokemon-name">{pokemon.name}</h1>
            <div className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</div>
            
            <div className="pokemon-types">
              {pokemon.types.map((typeObj, index) => (
                <span
                  key={index}
                  className="type-badge"
                  style={{ backgroundColor: getTypeColor(typeObj.type.name) }}
                >
                  {typeObj.type.name}
                </span>
              ))}
            </div>

            <button
              onClick={toggleFavorite}
              className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
            >
              {isFavorite ? '❤️ Remover dos Favoritos' : '🤍 Adicionar aos Favoritos'}
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Altura</span>
            <span className="stat-value">{formatHeight(pokemon.height)}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Peso</span>
            <span className="stat-value">{formatWeight(pokemon.weight)}</span>
          </div>
        </div>

        {/* Habilidades */}
        <div className="abilities-section">
          <h3>Habilidades</h3>
          <div className="abilities-list">
            {pokemon.abilities.map((ability, index) => (
              <span key={index} className="ability-badge">
                {ability.ability.name.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Estatísticas de batalha */}
        <div className="abilities-section">
          <h3>Estatísticas</h3>
          {pokemon.stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="stat-label">{formatStatName(stat.stat.name)}</span>
                <span className="stat-value">{stat.base_stat}</span>
              </div>
              <div className="stat-bar">
                <div 
                  className="stat-fill" 
                  style={{ width: `${Math.min(stat.base_stat, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Evoluções */}
        {evolutions.length > 1 && (
          <div className="evolutions-section">
            <h3>Evoluções</h3>
            <div className="evolution-chain">
              {evolutions.map((evo, index) => (
                <>
                  <Link 
                    href={`/pokemon/${evo.id}`} 
                    key={evo.id}
                    className="evolution-item"
                  >
                    <img
                      src={evo.image}
                      alt={evo.name}
                      className="evolution-image"
                      onError={(e) => {
                        e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png`
                      }}
                    />
                    <div className="evolution-name">{evo.name}</div>
                    <div className="evolution-id">#{evo.id.toString().padStart(3, '0')}</div>
                  </Link>
                  
                  {index < evolutions.length - 1 && (
                    <span key={`arrow-${index}`} className="arrow">→</span>
                  )}
                </>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}