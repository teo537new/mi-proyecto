'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginModal({ onClose }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onClose()
        router.refresh()
      } else {
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden')
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMode('login')
        setError(`Te enviamos un mail a ${email}. Por favor confirmalo para activar tu cuenta.`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      if (error) throw error
      setError(`Te enviamos un enlace a ${email}. Revisá tu correo para restablecer tu contraseña.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2><i className="fas fa-user-circle" style={{ color: '#00a8cc' }}></i> {mode === 'login' ? 'Bienvenido' : mode === 'forgot' ? 'Recuperar Contraseña' : 'Crear Cuenta'}</h2>
        <p>{mode === 'login' ? 'Inicia sesión para acceder a tus pedidos y ofertas exclusivas' : mode === 'forgot' ? 'Ingresá tu correo y te enviaremos un enlace' : 'Regístrate para empezar a comprar'}</p>

        {mode === 'forgot' ? (
          <form onSubmit={handleForgotPassword}>
            <input
              type="email"
              className="modal-input"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && (
              <p style={{ color: error.includes('enviamos') ? '#28a745' : '#dc3545', fontSize: '13px', marginBottom: '10px' }}>
                {error}
              </p>
            )}
            <button type="submit" className="modal-btn" disabled={loading}>
              {loading ? 'Cargando...' : 'Enviar enlace de recuperación'}
            </button>
            <div className="modal-link" style={{ marginTop: '15px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); setError('') }}>Volver a inicio de sesión</a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <input
                type="text"
                className="modal-input"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              className="modal-input"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="modal-input"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ paddingRight: '40px' }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  cursor: 'pointer', color: '#999', fontSize: '18px', userSelect: 'none',
                }}
              >
                <i className={`fas fa-eye${showPassword ? '' : '-slash'}`}></i>
              </span>
            </div>

            {mode === 'register' && (
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="modal-input"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ paddingRight: '40px' }}
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    cursor: 'pointer', color: '#999', fontSize: '18px', userSelect: 'none',
                  }}
                >
                  <i className={`fas fa-eye${showConfirmPassword ? '' : '-slash'}`}></i>
                </span>
              </div>
            )}

            {error && (
              <p style={{ color: error.includes('enviamos') ? '#28a745' : '#dc3545', fontSize: '13px', marginBottom: '10px' }}>
                {error}
              </p>
            )}
            <button type="submit" className="modal-btn" disabled={loading}>
              {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
            {mode === 'login' && (
              <div className="modal-link" style={{ marginTop: '10px' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setMode('forgot'); setError('') }}>¿Olvidaste tu contraseña?</a>
              </div>
            )}
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
          <span style={{ color: '#999', fontSize: '13px' }}>O continúa con</span>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e0e0e0',
            background: '#fff', cursor: 'pointer', fontSize: '15px', fontWeight: '500',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-2.5 6.2-8.6 10.5-15.5 9.2-4.2-.8-7.7-3.5-9.5-7.2-2.8-5.9-.7-13 5.1-16 3.3-1.7 7-2 10.5-.6 2.2.9 4.1 2.3 5.6 4.1l5.7-5.7C28.1 6.2 22.1 4 16 4 7.6 4 .7 10.3 0 18.8c-.4 5 1.2 10 4.5 13.8 2.5 2.9 5.9 5.1 9.8 6.1 6.5 1.7 13.4-.3 17.9-5 3.5-3.7 5.3-8.6 5.3-13.8 0-1.3-.1-2.5-.3-3.7z"/><path fill="#FF3D00" d="M6.4 14.5l4.9 3.6C13 14.5 17.6 12 23 12c3.5 0 6.7 1.2 9.2 3.3l5.4-5.4C33.5 5.7 28.5 4 23 4 16.1 4 10.3 7.9 6.4 14.5z"/><path fill="#4CAF50" d="M23 44c5.7 0 10.9-2.1 14.8-5.7l-4.7-4c-2.1 1.5-4.7 2.4-7.6 2.4-5.3 0-9.9-3-12.1-7.4l-5 3.9C11.2 39.1 16.8 44 23 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-1.2 3-3.3 5.5-5.9 7.1l4.7 4c3.3-3 5.4-7.1 5.4-11.7 0-1.3-.1-2.5-.3-3.7z"/></svg>
          {loading ? 'Cargando...' : 'Google'}
        </button>

        <div className="modal-link">
          {mode === 'login' ? (
            <>¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setMode('register'); setError('') }}>Regístrate gratis</a></>
          ) : (
            <>¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); setError('') }}>Inicia sesión</a></>
          )}
        </div>
      </div>
    </div>
  )
}
