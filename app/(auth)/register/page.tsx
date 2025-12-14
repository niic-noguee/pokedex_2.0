'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import '../Auth.css'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido')
      return false
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Este email já está cadastrado. Faça login.')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      if (authData.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert([
            { 
              id: authData.user.id,
              email: formData.email,
              name: formData.name
            }
          ])

        if (dbError) {
          console.warn('Erro ao inserir na tabela users:', dbError)
        }
      }

      setSuccess('Conta criada com sucesso! Redirecionando...')
      
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (!loginError) {
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 2000)
      }

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro durante o registro')
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
            <p className="auth-subtitle">Crie sua conta para começar</p>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}
          
          {success && (
            <div className="success-message">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${error && !formData.name ? 'error' : ''}`}
                placeholder="Seu nome"
                disabled={loading}
              />
            </div>

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
              <div className="password-requirements">
                Mínimo 6 caracteres
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${error && !formData.confirmPassword ? 'error' : ''}`}
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
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Já tem uma conta?{' '}
              <Link href="/login" className="auth-link">
                Faça login aqui
              </Link>
            </p>
            <p>
              <Link href="/" className="auth-link">
                ← Voltar para a Pokédex
              </Link>
            </p>
          </div>

          <div className="auth-footer">
            <p>Ao se registrar, você concorda com nossos Termos de Uso</p>
          </div>
        </div>
      </div>
    </div>
  )
}