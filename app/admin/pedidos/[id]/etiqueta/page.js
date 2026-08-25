'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EtiquetaPage() {
  const { id } = useParams()
  const supabase = createClient()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single()
      setOrder(data)
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <p style={{ color: '#999' }}>Cargando etiqueta...</p>
  if (!order) return <p>Pedido no encontrado.</p>

  const direccion = [order.shipping_barrio, order.shipping_ciudad, order.shipping_partido]
    .filter(Boolean)
    .join(', ')
  const totalItems = (order.order_items || []).reduce((acc, i) => acc + i.quantity, 0)

  return (
    <>
      <div className="no-print" style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
        <button
          className="modal-btn"
          style={{ width: 'auto', padding: '10px 30px', marginTop: 0 }}
          onClick={() => window.print()}
        >
          <i className="fas fa-print"></i> Imprimir / Guardar PDF
        </button>
        <Link
          href="/admin/pedidos"
          className="modal-btn"
          style={{
            width: 'auto',
            padding: '10px 30px',
            marginTop: 0,
            background: '#e0e0e0',
            color: '#333',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Volver a pedidos
        </Link>
      </div>

      <div className="shipping-label">
        <div className="label-header">
          <img src="/pcafondo4.png" alt="PC Afondo" className="label-logo" />
          <div className="label-order">
            <strong>Pedido #{order.id}</strong>
            <span>{new Date(order.created_at).toLocaleDateString('es-AR')}</span>
          </div>
        </div>

        <div className="label-section">
          <span className="label-title">Destinatario</span>
          <p className="label-big">{order.shipping_name}</p>
          <p className="label-text">Tel: {order.shipping_phone}</p>
        </div>

        <div className="label-section">
          <span className="label-title">Dirección de envío</span>
          <p className="label-big">{order.shipping_address}</p>
          {direccion && <p className="label-text">{direccion}</p>}
          {order.shipping_codigo_postal && (
            <p className="label-text">CP {order.shipping_codigo_postal}</p>
          )}
        </div>

        {order.notes && (
          <div className="label-section">
            <span className="label-title">Nota</span>
            <p className="label-text">{order.notes}</p>
          </div>
        )}

        <div className="label-footer">
          <span>
            {totalItems} artículo{totalItems !== 1 ? 's' : ''}
            {' · '}
            {order.payment_method === 'transfer' ? 'Transferencia' : 'Mercado Pago'}
          </span>
          <strong>${Number(order.total).toLocaleString('es-AR')}</strong>
        </div>
      </div>
    </>
  )
}
