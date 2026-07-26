'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { createClient } from '@/lib/supabase/client'

const statusLabels = {
  pending: 'A verificar',
  paid: 'Pagado',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      setLoading(false)
      return
    }
    if (!user) return

    const load = async () => {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
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
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div className="orders-container">
        <h1>Mis Pedidos</h1>
        <p style={{ color: '#999', padding: '40px 0' }}>Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="orders-container">
        <h1>Mis Pedidos</h1>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <i className="fas fa-lock" style={{ fontSize: '60px', marginBottom: '20px', color: '#e0e0e0' }}></i>
          <p>Inicia sesión para ver tus pedidos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-container">
      <h1>Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <i className="fas fa-box-open" style={{ fontSize: '60px', marginBottom: '20px', color: '#e0e0e0' }}></i>
          <p>No tienes pedidos aún</p>
        </div>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-header">
              <div>
                <strong>Pedido #{order.id}</strong>
                <span style={{ color: '#999', marginLeft: '15px', fontSize: '13px' }}>
                  {new Date(order.created_at).toLocaleDateString('es-AR')}
                </span>
              </div>
              <span className={`order-status status-${order.status}`}>
                {statusLabels[order.status]}
              </span>
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
                <span style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>${(item.unit_price * item.quantity).toLocaleString('es-AR')}</span>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', fontSize: '18px', fontWeight: '700' }}>
              <span>Total</span>
              <span style={{ color: '#ff6b35' }}>${Number(order.total).toLocaleString('es-AR')}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
