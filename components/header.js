'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { useCart } from '@/lib/context/cart-context'
import { createClient } from '@/lib/supabase/client'
import LoginModal from './login-modal'

export default function Header() {
  const { user, profile } = useAuth()
  const { count } = useCart()
  const router = useRouter()
  const supabase = createClient()
  const [showLogin, setShowLogin] = useState(false)
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/?search=${encodeURIComponent(search.trim())}`)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <>
      <header className="header">
        <div className="logo-area">
          <Link href="/">
            <img src="/pcafondo4.png" alt="PCAFondo.com" />
          </Link>
        </div>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar productos, componentes, gadgets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit"><i className="fas fa-search"></i></button>
        </form>

        <div className="header-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {profile?.role !== 'admin' && (
                <Link href="/mis-pedidos" className="header-btn">
                  <i className="fas fa-user-circle"></i>
                  <span>{profile?.name || user?.email?.split('@')[0] || 'Mi Cuenta'}</span>
                </Link>
              )}
              {profile?.role === 'admin' && (
                <Link href="/admin" className="header-btn">
                  <i className="fas fa-cog"></i>
                  <span>Admin</span>
                </Link>
              )}
              <button className="header-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <button className="header-btn" onClick={() => setShowLogin(true)}>
              <i className="fas fa-user-circle"></i>
              <span>Iniciar Sesión</span>
            </button>
          )}
          <div className="cart-wrapper">
            <button className="header-btn" onClick={() => {
              const event = new CustomEvent('toggleCart')
              window.dispatchEvent(event)
            }}>
              <i className="fas fa-shopping-cart"></i>
              <span>Carrito</span>
            </button>
            <span className="cart-count">{count}</span>
          </div>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
