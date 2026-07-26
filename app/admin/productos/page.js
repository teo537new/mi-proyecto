'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminProductos() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto definitivamente?')) return
    const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      alert('Error al eliminar: ' + (data.error || 'desconocido'))
      return
    }
    setProducts((prev) => prev.filter((p) => p.id !== id))
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: 'Producto eliminado',
    }))
  }

  const toggleActive = async (id, current) => {
    const res = await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: !current }),
    })
    if (!res.ok) {
      const data = await res.json()
      alert('Error al cambiar estado: ' + (data.error || 'desconocido'))
      return
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !current } : p))
    )
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: `Producto ${!current ? 'activado' : 'desactivado'}`,
    }))
  }

  if (loading) return <p>Cargando...</p>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Productos ({products.length})</h1>
        <Link href="/admin/productos/nuevo" className="modal-btn" style={{ width: 'auto', padding: '12px 25px', textDecoration: 'none', display: 'inline-block' }}>
          <i className="fas fa-plus"></i> Nuevo Producto
        </Link>
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e8e8e8' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f7fa', textAlign: 'left' }}>
              <th style={{ padding: '15px 20px', fontSize: '13px', color: '#999' }}>Producto</th>
              <th style={{ padding: '15px 20px', fontSize: '13px', color: '#999' }}>Precio</th>
              <th style={{ padding: '15px 20px', fontSize: '13px', color: '#999' }}>Stock</th>
              <th style={{ padding: '15px 20px', fontSize: '13px', color: '#999' }}>Estado</th>
              <th style={{ padding: '15px 20px', fontSize: '13px', color: '#999' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderTop: '1px solid #f0f0f0', opacity: p.active ? 1 : 0.5 }}>
                <td style={{ padding: '15px 20px', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                    )}
                    {p.name}
                  </div>
                </td>
                <td style={{ padding: '15px 20px', color: '#ff6b35', fontWeight: '700' }}>
                  ${Number(p.price).toLocaleString('es-AR')}
                </td>
                <td style={{ padding: '15px 20px', fontSize: '14px' }}>
                  {p.stock_type === 'stock' ? `${p.stock_quantity} uds.` : 'A Pedido'}
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <button
                    onClick={() => toggleActive(p.id, p.active)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: p.active ? '#28a745' : '#dc3545',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <i className={`fas fa-${p.active ? 'toggle-on' : 'toggle-off'}`} style={{ fontSize: '20px' }}></i>
                    {p.active ? 'Activo' : 'Pausado'}
                  </button>
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      href={`/admin/productos/editar/${p.id}`}
                      style={{ background: 'none', border: 'none', color: '#00a8cc', cursor: 'pointer', fontSize: '16px' }}
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '16px' }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
