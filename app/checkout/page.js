'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '@/lib/context/auth-context'
import { useCart } from '@/lib/context/cart-context'
import { createClient } from '@/lib/supabase/client'
import { buildTransferQR } from '@/lib/qr-code'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [settings, setSettings] = useState(null)
  const [form, setForm] = useState({
    name: '',
    address: '',
    barrio: '',
    ciudad: '',
    partido: '',
    codigo_postal: '',
    phone: '',
    notes: '',
  })

  useEffect(() => {
    supabase.from('store_settings').select('*').single().then(({ data }) => {
      if (data) setSettings(data)
    })
  }, [])

  const qrPayload = useMemo(() => {
    if (!settings?.cuit || !settings?.cbu_number) return null
    return buildTransferQR({
      cuit: settings.cuit,
      cbu: settings.cbu_number,
      name: settings.store_name,
      city: settings.store_city,
    })
  }, [settings])

  if (!user) {
    return (
      <div className="checkout-container">
        <h1>Checkout</h1>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <i className="fas fa-lock" style={{ fontSize: '60px', marginBottom: '20px', color: '#e0e0e0' }}></i>
          <p>Debes iniciar sesión para finalizar la compra</p>
        </div>
      </div>
    )
  }

  if (items.length === 0 && !done) {
    return (
      <div className="checkout-container">
        <h1>Checkout</h1>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <i className="fas fa-shopping-basket" style={{ fontSize: '60px', marginBottom: '20px', color: '#e0e0e0' }}></i>
          <p>Tu carrito está vacío</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total,
        shipping_name: form.name,
        shipping_address: form.address,
        shipping_barrio: form.barrio || null,
        shipping_ciudad: form.ciudad,
        shipping_partido: form.partido || null,
        shipping_codigo_postal: form.codigo_postal || null,
        shipping_phone: form.phone,
        payment_method: 'transfer',
        notes: form.notes,
        status: 'pending',
        status_history: [{ status: 'pending', at: new Date().toISOString() }],
      })
      .select()
      .single()

    if (error) {
      alert('Error al crear el pedido: ' + error.message)
      setLoading(false)
      return
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.qty,
      unit_price: item.price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      alert('Error al guardar los items: ' + itemsError.message)
      setLoading(false)
      return
    }

    clearCart()
    setDone(true)
    setLoading(false)
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  if (done) {
    return (
      <div className="checkout-container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <i className="fas fa-check-circle" style={{ fontSize: '80px', color: '#00a650', marginBottom: '20px' }}></i>
          <h1 style={{ color: '#1a1a2e', marginBottom: '15px' }}>Pago registrado</h1>
          <p style={{ color: '#666', fontSize: '16px', maxWidth: '500px', margin: '0 auto 30px' }}>
            Ya avisamos de tu pago, en unos minutos lo confirmamos.
          </p>
          <button className="btn-buy" style={{ width: 'auto', padding: '14px 40px', display: 'inline-block' }} onClick={() => router.push('/mis-pedidos')}>
            Ver mis pedidos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-container">
      <h1>Finalizar Compra</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px', alignItems: 'start' }}>
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Datos Personales y Envío</h3>

          <div className="form-group">
            <label>Nombre completo</label>
            <input className="form-control" value={form.name} onChange={update('name')} required />
          </div>

          <div className="form-group">
            <label>Dirección de envío</label>
            <input className="form-control" value={form.address} onChange={update('address')} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Barrio</label>
              <input className="form-control" value={form.barrio} onChange={update('barrio')} />
            </div>
            <div className="form-group">
              <label>Ciudad</label>
              <input className="form-control" value={form.ciudad} onChange={update('ciudad')} required />
            </div>
            <div className="form-group">
              <label>Partido</label>
              <input className="form-control" value={form.partido} onChange={update('partido')} />
            </div>
            <div className="form-group">
              <label>Código Postal</label>
              <input className="form-control" value={form.codigo_postal} onChange={update('codigo_postal')} />
            </div>
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input className="form-control" value={form.phone} onChange={update('phone')} required />
          </div>

          <div className="form-group">
            <label>Notas (opcional)</label>
            <textarea className="form-control" rows="3" value={form.notes} onChange={update('notes')}></textarea>
          </div>

          <h3 style={{ marginTop: '30px' }}>Método de Pago</h3>

          {settings ? (
            <div style={{ background: '#f0faf0', border: '1px solid #d4edda', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
              <p style={{ fontWeight: '600', color: '#155724', marginBottom: '15px' }}>
                <i className="fas fa-university" style={{ marginRight: '8px' }}></i>
                Transferencia Bancaria
              </p>
              <p style={{ fontSize: '13px', color: '#555', marginBottom: '15px' }}>
                Escaneá el QR o transferí manualmente desde tu billetera virtual / home banking.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                  {qrPayload ? (
                    <QRCodeSVG value={qrPayload} size={200} />
                  ) : (
                    <div
                      style={{
                        width: 200,
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#fafafa',
                        borderRadius: '8px',
                        color: '#bbb',
                        fontSize: '13px',
                        textAlign: 'center',
                        padding: '20px',
                      }}
                    >
                      El comercio aún no configuró el CUIT. Podés transferir con el alias/CBU de abajo.
                    </div>
                  )}
                </div>
              </div>
              <div style={{ background: '#fff', border: '2px solid #28a745', borderRadius: '10px', padding: '15px', marginBottom: '5px' }}>
                <p style={{ fontSize: '13px', color: '#155724', fontWeight: '600', marginBottom: '10px' }}>
                  <i className="fas fa-shield-alt"></i> Verificá que los datos coincidan antes de transferir:
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e8f5e9', fontSize: '14px' }}>
                  <span style={{ color: '#666' }}>Alias:</span>
                  <strong style={{ color: '#1a1a2e', fontSize: '16px' }}>{settings.cbu_alias}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px' }}>
                  <span style={{ color: '#666' }}>CBU:</span>
                  <strong style={{ color: '#1a1a2e', fontSize: '16px' }}>{settings.cbu_number || '—'}</strong>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#999', fontStyle: 'italic' }}>Cargando datos de pago...</p>
          )}

          <button type="submit" className="btn-buy" disabled={loading} style={{ fontSize: '16px', padding: '16px' }}>
            {loading ? 'Procesando...' : 'Ya transferí'}
          </button>
        </form>

        <div style={{ background: '#fff', borderRadius: '14px', padding: '25px', border: '1px solid #e8e8e8' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #00a8cc' }}>Resumen</h3>
          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', fontSize: '14px' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <i className="fas fa-box" style={{ color: '#ccc', fontSize: '18px' }}></i>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div>{item.name}</div>
                <div style={{ color: '#999', fontSize: '12px' }}>Cantidad: {item.qty}</div>
              </div>
              <span style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>${(item.price * item.qty).toLocaleString('es-AR')}</span>
            </div>
          ))}
          <div style={{ borderTop: '2px solid #e0e0e0', paddingTop: '15px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700' }}>
            <span>Total</span>
            <span style={{ color: '#ff6b35' }}>${total.toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
