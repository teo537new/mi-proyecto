'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { count: products } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      const { data: orders, count: ordersCount } = await supabase
        .from('orders')
        .select('total, status', { count: 'exact' })

      const revenue = orders?.reduce((acc, o) => acc + Number(o.total), 0) || 0
      const pendingOrders = orders?.filter((o) => o.status === 'pending').length || 0

      setStats({
        products: products || 0,
        orders: ordersCount || orders?.length || 0,
        revenue,
        pendingOrders,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p style={{ color: '#999' }}>Cargando dashboard...</p>

  const formatPrice = (num) =>
    '$' + Number(num).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <>
      <h1 style={{ marginBottom: '30px' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px' }}>
        <Card icon="fa-box" color="#00a8cc" label="Productos" value={stats.products} />
        <Card icon="fa-shopping-cart" color="#ff6b35" label="Pedidos" value={stats.orders} />
        <Card icon="fa-clock" color="#ffc107" label="Pendientes" value={stats.pendingOrders || 0} />
        <Card icon="fa-dollar-sign" color="#28a745" label="Ingresos" value={formatPrice(stats.revenue)} />
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', padding: '30px', border: '1px solid #e8e8e8' }}>
        <h3 style={{ marginBottom: '15px', color: '#1a1a2e' }}>Links rápidos</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <QuickLink href="/admin/productos/nuevo" icon="fa-plus" label="Nuevo Producto" color="#00a8cc" />
          <QuickLink href="/admin/pedidos" icon="fa-truck" label="Ver Pedidos" color="#ff6b35" />
          <QuickLink href="/admin/productos" icon="fa-box" label="Todos los Productos" color="#28a745" />
        </div>
      </div>
    </>
  )
}

function Card({ icon, color, label, value }) {
  return (
    <div style={{ background: '#fff', borderRadius: '14px', padding: '25px', border: '1px solid #e8e8e8' }}>
      <i className={`fas ${icon}`} style={{ fontSize: '28px', color, marginBottom: '15px' }}></i>
      <h3 style={{ fontSize: '13px', color: '#999', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</h3>
      <p style={{ fontSize: '28px', fontWeight: '900', color: '#1a1a2e' }}>{value}</p>
    </div>
  )
}

function QuickLink({ href, icon, label, color }) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 20px',
        background: '#f5f7fa',
        borderRadius: '10px',
        color: '#333',
        fontWeight: '600',
        fontSize: '14px',
        textDecoration: 'none',
        transition: 'all 0.3s',
      }}
      onMouseOver={(e) => e.currentTarget.style.background = color + '15'}
      onMouseOut={(e) => e.currentTarget.style.background = '#f5f7fa'}
    >
      <i className={`fas ${icon}`} style={{ color }}></i>
      {label}
    </a>
  )
}
