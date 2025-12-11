'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import PokemonCard from '@/components/PokemonCard'
import './globals.css'

export default function HomePage() {
  const [pokemons, setPokemons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchPokemons = async (loadMore = false) => {
    try {
      setLoading(true)
      const newOffset = loadMore ? offset : 0
      const limit = 20
      
      let url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${newOffset}`
      
      if (searchTerm) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`)
        if (response.ok) {
          const singlePokemon = await response.json()
          setPokemons([{
            id: singlePokemon.id,
            name: singlePokemon.name,
            image: singlePokemon.sprites.front_default,
            types: singlePokemon.types.map((t: any) => t.type.name)
          }])
          setLoading(false)
          return
        }
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon: any) => {
          const details = await fetch(pokemon.url).then(res => res.json())
          return {
            id: details.id,
            name: details.name,
            image: details.sprites.front_default,
            types: details.types.map((t: any) => t.type.name)
          }
        })
      )
      
      if (loadMore) {
        setPokemons([...pokemons, ...pokemonDetails])
        setOffset(newOffset + limit)
      } else {
        setPokemons(pokemonDetails)
        setOffset(limit)
      }
    } catch (error) {
      console.error('Erro ao buscar pokémons:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPokemons()
  }, [])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    fetchPokemons()
  }

  const loadMorePokemons = () => {
    fetchPokemons(true)
  }

  return (
    <div>
      <Header onSearch={handleSearch} />
      
      <div className="container">
        {/* Grid de Pokémons */}
        <div className="pokeContainer">
          {loading && pokemons.length === 0 ? (
            <div className="text-center">Carregando pokémons...</div>
          ) : pokemons.length === 0 ? (
            <div className="text-center">Nenhum pokémon encontrado.</div>
          ) : (
            pokemons.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))
          )}
        </div>

        {/* Botão Carregar Mais (só mostra se não estiver pesquisando) */}
        {!searchTerm && pokemons.length > 0 && (
          <button 
            className="load-more-btn"
            onClick={loadMorePokemons}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Carregar mais Pokémon'}
          </button>
        )}
      </div>
    </div>
  )
}