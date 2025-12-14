'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import '../Auth.css'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos')
      setLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Por favor, insira um email válido')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('Email ou senha incorretos')
        } else {
          setError(error.message)
        }
        setLoading(false)
        return
      }

      setSuccess('Login realizado com sucesso!')
      
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1500)

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro durante o login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="pokeball-icon"></div>
              <h1 className="auth-title">Pokédex</h1>
            </div>
            <p className="auth-subtitle">Entre na sua conta para continuar</p>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}
          
          {success && (
            <div className="success-message">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${error && !formData.email ? 'error' : ''}`}
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${error && !formData.password ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading && <span className="spinner"></span>}
              {loading ? 'Entrando...' : 'Entrar na Conta'}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Não tem uma conta?{' '}
              <Link href="/register" className="auth-link">
                Cadastre-se aqui
              </Link>
            </p>
            <p>
              <Link href="/" className="auth-link">
                ← Voltar para a Pokédex
              </Link>
            </p>
          </div>

          <div className="auth-footer">
            <p>Use suas credenciais para acessar sua coleção Pokémon</p>
          </div>
        </div>
      </div>
    </div>
  )
}