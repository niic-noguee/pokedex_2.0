'use client'

import { useState } from 'react'
import './Header.css'

interface HeaderProps {
  onSearch?: (searchTerm: string) => void
}

export default function Header({ onSearch }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState('')

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

  return (
    <header className="header">
      <h1 className="page-title">Pokédex</h1>
      
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