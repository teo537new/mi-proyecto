'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/')
      else setChecking(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden')
    }
    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres')
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (checking) return <p style={{ textAlign: 'center', color: '#999', marginTop: '100px' }}>Verificando sesión...</p>

  if (success) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
        <i className="fas fa-check-circle" style={{ fontSize: '60px', color: '#28a745' }}></i>
        <h2 style={{ margin: '20px 0', color: '#1a1a2e' }}>Contraseña actualizada</h2>
        <p style={{ color: '#666' }}>Tu contraseña se cambió correctamente. Serás redirigido al inicio...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '420px', margin: '100px auto' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '14px', border: '1px solid #e8e8e8' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#1a1a2e' }}>
          <i className="fas fa-lock" style={{ color: '#00a8cc', marginRight: '8px' }}></i>
          Nueva contraseña
        </h2>
        <p style={{ textAlign: 'center', color: '#999', fontSize: '14px', marginBottom: '25px' }}>
          Ingresá tu nueva contraseña
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="modal-input"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ paddingRight: '40px' }}
            />
            <span onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#999', fontSize: '18px', userSelect: 'none' }}>
              <i className={`fas fa-eye${showPassword ? '' : '-slash'}`}></i>
            </span>
          </div>

          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              className="modal-input"
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={{ paddingRight: '40px' }}
            />
            <span onClick={() => setShowConfirm(!showConfirm)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#999', fontSize: '18px', userSelect: 'none' }}>
              <i className={`fas fa-eye${showConfirm ? '' : '-slash'}`}></i>
            </span>
          </div>

          {error && (
            <p style={{ color: '#dc3545', fontSize: '13px', marginBottom: '10px' }}>{error}</p>
          )}

          <button type="submit" className="modal-btn" disabled={loading}>
            {loading ? 'Cambiando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
