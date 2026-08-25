'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const statuses = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled']
const statusLabels = {
  pending: 'A verificar',
  paid: 'Pagado',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, order_items(*), profiles(name)')
        .order('created_at', { ascending: false })

      const productIds = [...new Set((ordersData || []).flatMap(o => o.order_items?.map(i => i.product_id).filter(Boolean) || []))]
      let productImages = {}
      if (productIds.length > 0) {
        const { data: products } = await supabase.from('products').select('id, images').in('id', productIds)
        for (const p of products || []) {
          productImages[p.id] = p.images
        }
      }

      setOrders((ordersData || []).map(o => ({
        ...o,
        order_items: (o.order_items || []).map(item => ({
          ...item,
          images: productImages[item.product_id] || [],
        })),
      })))
      setLoading(false)
    }
    load()
  }, [])

  const updateStatus = async (id, newStatus, order) => {
    const history = order.status_history || []
    const newEntry = { status: newStatus, at: new Date().toISOString() }
    await supabase.from('orders').update({ status: newStatus, status_history: [...history, newEntry] }).eq('id', id)
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus, status_history: [...history, newEntry] } : o))
    )
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este pedido permanentemente?')) return
    await supabase.from('order_items').delete().eq('order_id', id)
    await supabase.from('orders').delete().eq('id', id)
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }

  if (loading) return <p>Cargando...</p>

  return (
    <>
      <h1 style={{ marginBottom: '30px' }}>Pedidos</h1>

      {orders.length === 0 ? (
        <p style={{ color: '#999' }}>No hay pedidos aún.</p>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-header">
              <div>
                <strong>Pedido #{order.id}</strong>
                <span style={{ color: '#999', marginLeft: '15px', fontSize: '13px' }}>
                  {new Date(order.created_at).toLocaleDateString('es-AR')}
                </span>
                <span style={{ color: '#999', marginLeft: '15px', fontSize: '13px' }}>
                  {order.profiles?.name || 'Usuario #' + order.user_id?.slice(0, 8)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value, order)}
                  className="form-control"
                  style={{ width: 'auto', padding: '6px 12px' }}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
                <span className={`order-status status-${order.status}`}>
                  {statusLabels[order.status]}
                </span>
                <Link
                  href={`/admin/pedidos/${order.id}/etiqueta`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#00a8cc',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px 8px',
                  }}
                  title="Imprimir etiqueta de envío"
                >
                  <i className="fas fa-print"></i>
                </Link>
                <button
                  onClick={() => handleDelete(order.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc3545',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px 8px',
                  }}
                  title="Eliminar pedido"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
              <i className="fas fa-user"></i> {order.shipping_name}<br />
              <i className="fas fa-map-marker-alt"></i> {order.shipping_address}
              {order.shipping_barrio && <span>, {order.shipping_barrio}</span>}
              {order.shipping_ciudad && <span>, {order.shipping_ciudad}</span>}
              {order.shipping_partido && <span>, {order.shipping_partido}</span>}
              {order.shipping_codigo_postal && <span> &mdash; CP: {order.shipping_codigo_postal}</span>}
              <br />
              <i className="fas fa-phone"></i> {order.shipping_phone}<br />
              <i className="fas fa-credit-card"></i> {order.payment_method === 'transfer' ? 'Transferencia' : 'Mercado Pago'}
              {order.notes && <><br /><i className="fas fa-sticky-note"></i> Nota: {order.notes}</>}
            </div>

            {order.status_history?.length > 1 && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '15px', padding: '10px 0', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
                {order.status_history.map((entry, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: i === order.status_history.length - 1 ? '#00a8cc' : '#999' }}>
                    <span style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: i === order.status_history.length - 1 ? '#00a8cc' : '#e0e0e0',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                    }}>
                      {i === order.status_history.length - 1 ? '✓' : '•'}
                    </span>
                    <span>{statusLabels[entry.status]}</span>
                    <span style={{ color: '#ccc' }}>{new Date(entry.at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}

            {order.order_items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className="fas fa-box" style={{ color: '#ccc', fontSize: '20px' }}></i>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div>{item.product_name}</div>
                  <div style={{ color: '#999', fontSize: '13px' }}>Cantidad: {item.quantity}</div>
                </div>
                <span style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>${(item.unit_price * item.quantity).toLocaleString()}</span>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', fontSize: '18px', fontWeight: '700' }}>
              <span>Total</span>
              <span style={{ color: '#ff6b35' }}>${Number(order.total).toLocaleString('es-AR')}</span>
            </div>
          </div>
        ))
      )}
    </>
  )
}
