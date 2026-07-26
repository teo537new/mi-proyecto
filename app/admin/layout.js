'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }) {
  const { user, profile, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/')
    }
  }, [user, profile, loading])

  if (loading) return null
  if (!user || profile?.role !== 'admin') return null

  const links = [
    { href: '/admin', label: 'Dashboard', icon: 'fa-chart-simple' },
    { href: '/admin/productos', label: 'Productos', icon: 'fa-box' },
    { href: '/admin/usuarios', label: 'Usuarios', icon: 'fa-users' },
    { href: '/admin/pedidos', label: 'Pedidos', icon: 'fa-truck' },
    { href: '/admin/configuracion', label: 'Configuración', icon: 'fa-cog' },
  ]

  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <h2><i className="fas fa-cog"></i> Panel Admin</h2>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'active' : ''}
          >
            <i className={`fas ${link.icon}`}></i> {link.label}
          </Link>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '30px' }}>
          <Link href="/"><i className="fas fa-store"></i> Tienda</Link>
          <a href="#" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
          </a>
        </div>
      </div>
      <div className="admin-content">{children}</div>
    </div>
  )
}
