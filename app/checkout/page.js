'use client'

import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { useCart } from '@/lib/context/cart-context'
import { createClient } from '@/lib/supabase/client'

const BANKS = [
  'Mercado Pago',
  'MODO',
  'Banco Nación',
  'Banco Galicia',
  'Banco Provincia',
  'Santander',
  'BBVA',
  'Otro',
]

const STEPS = [
  { n: 1, label: 'Cuenta' },
  { n: 2, label: 'Envío' },
  { n: 3, label: 'Pago' },
]

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [settings, setSettings] = useState(null)
  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState(null)
  const [form, setForm] = useState({
    acct_origin: '',
    acct_holder: '',
    acct_number: '',
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

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const copyToClipboard = async (key, value) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      alert('No se pudo copiar automáticamente. Copiá manualmente: ' + value)
    }
  }

  const validateStep1 = () => {
    if (!form.acct_origin) {
      alert('Elegí el banco o billetera desde donde vas a transferir.')
      return false
    }
    if (!form.acct_holder.trim()) {
      alert('Ingresá el nombre del titular de la cuenta de origen.')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!form.name.trim()) return alert('Ingresá tu nombre completo.'), false
    if (!form.address.trim()) return alert('Ingresá la dirección de envío.'), false
    if (!form.ciudad.trim()) return alert('Ingresá la ciudad.'), false
    if (!form.codigo_postal.trim()) return alert('Ingresá el código postal.'), false
    if (!form.phone.trim()) return alert('Ingresá tu teléfono.'), false
    return true
  }

  const goNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((s) => Math.min(s + 1, 3))
  }

  const goBack = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total,
        acct_origin: form.acct_origin,
        acct_holder: form.acct_holder.trim(),
        acct_number: form.acct_number.trim() || null,
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

      <div className="checkout-steps">
        {STEPS.map((s, i) => (
          <Fragment key={s.n}>
            {i > 0 && <div className="step-line" />}
            <div className={`checkout-step ${step === s.n ? 'active' : ''} ${step > s.n ? 'done' : ''}`}>
              <span className="step-num">{step > s.n ? '✓' : s.n}</span>
              <span>{s.label}</span>
            </div>
          </Fragment>
        ))}
      </div>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <h3>Paso 1 · ¿Desde qué cuenta transferís?</h3>
              <p style={{ fontSize: '13px', color: '#666', marginTop: '-10px', marginBottom: '20px' }}>
                De dónde va a salir la plata. Nos sirve para verificar tu pago.
              </p>

              <div className="form-group">
                <label>Banco o billetera</label>
                <select className="form-control" value={form.acct_origin} onChange={update('acct_origin')}>
                  <option value="">Seleccioná...</option>
                  {BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Titular de la cuenta</label>
                <input
                  className="form-control"
                  value={form.acct_holder}
                  onChange={update('acct_holder')}
                  placeholder="Nombre y apellido como figura en la cuenta"
                />
              </div>

              <div className="form-group">
                <label>CBU/CVU de origen (opcional)</label>
                <input
                  className="form-control"
                  value={form.acct_number}
                  onChange={update('acct_number')}
                  placeholder="Opcional"
                />
              </div>

              <button type="button" className="btn-buy" onClick={goNext} style={{ fontSize: '16px', padding: '16px' }}>
                Continuar
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h3>Paso 2 · Datos de envío</h3>

              <div className="form-group">
                <label>Nombre completo</label>
                <input className="form-control" value={form.name} onChange={update('name')} required />
              </div>

              <div className="form-group">
                <label>Dirección de envío</label>
                <input className="form-control" value={form.address} onChange={update('address')} required />
              </div>

              <div className="checkout-row">
                <div className="form-group">
                  <label>Barrio (opcional)</label>
                  <input className="form-control" value={form.barrio} onChange={update('barrio')} />
                </div>
                <div className="form-group">
                  <label>Ciudad</label>
                  <input className="form-control" value={form.ciudad} onChange={update('ciudad')} required />
                </div>
                <div className="form-group">
                  <label>Partido (opcional)</label>
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

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={goBack}
                  style={{ flex: 1, padding: '16px', fontSize: '16px', background: '#fff', color: '#666', border: '2px solid #e0e0e0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Volver
                </button>
                <button type="button" className="btn-buy" onClick={goNext} style={{ flex: 2, fontSize: '16px', padding: '16px' }}>
                  Continuar
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3>Paso 3 · Transferí y avisá</h3>

              {settings ? (
                <div style={{ background: '#f0faf0', border: '1px solid #d4edda', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '14px', color: '#155724', marginBottom: '15px' }}>
                    Transferí exactamente{' '}
                    <strong>${total.toLocaleString('es-AR')}</strong> a esta cuenta.
                    Las transferencias entre personas son <strong>sin comisión</strong>.
                  </p>

                  <div style={{ background: '#fff', border: '2px solid #28a745', borderRadius: '10px', padding: '15px' }}>
                    <p style={{ fontSize: '13px', color: '#155724', fontWeight: '600', marginBottom: '10px' }}>
                      <i className="fas fa-shield-alt"></i> Datos para transferir:
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #e8f5e9', fontSize: '14px' }}>
                      <span style={{ color: '#666' }}>Titular:</span>
                      <strong style={{ color: '#1a1a2e', fontSize: '15px', textAlign: 'right' }}>{settings.store_name || '—'}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #e8f5e9', fontSize: '14px' }}>
                      <span style={{ color: '#666' }}>Alias:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ color: '#1a1a2e', fontSize: '16px' }}>{settings.cbu_alias || '—'}</strong>
                        <button type="button" className={`copy-btn ${copied === 'alias' ? 'copied' : ''}`} onClick={() => copyToClipboard('alias', settings.cbu_alias)}>
                          {copied === 'alias' ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '6px 0', fontSize: '14px' }}>
                      <span style={{ color: '#666' }}>CBU/CVU:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ color: '#1a1a2e', fontSize: '14px' }}>{settings.cbu_number || '—'}</strong>
                        {settings.cbu_number && (
                          <button type="button" className={`copy-btn ${copied === 'cbu' ? 'copied' : ''}`} onClick={() => copyToClipboard('cbu', settings.cbu_number)}>
                            {copied === 'cbu' ? '¡Copiado!' : 'Copiar'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '15px', fontSize: '13px', color: '#666', lineHeight: '1.9' }}>
                    <strong style={{ color: '#155724' }}>Pasos:</strong>
                    <div>1. Abrí tu billetera (Mercado Pago, MODO o la app de tu banco).</div>
                    <div>2. Tocá &quot;Transferir&quot; e ingresá el alias o el CBU/CVU de arriba.</div>
                    <div>3. Confirmá la transferencia por el total de tu pedido.</div>
                    <div>4. Volvé acá y tocá &quot;Ya transferí&quot;.</div>
                  </div>

                  <p style={{ fontSize: '12px', color: '#888', marginTop: '12px' }}>
                    Vas a transferir desde <strong>{form.acct_origin}</strong> a nombre de <strong>{form.acct_holder}</strong>.
                  </p>
                </div>
              ) : (
                <p style={{ color: '#999', fontStyle: 'italic' }}>Cargando datos de pago...</p>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={goBack}
                  style={{ flex: 1, padding: '16px', fontSize: '16px', background: '#fff', color: '#666', border: '2px solid #e0e0e0', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Volver
                </button>
                <button type="submit" className="btn-buy" disabled={loading} style={{ flex: 2, fontSize: '16px', padding: '16px' }}>
                  {loading ? 'Procesando...' : 'Ya transferí'}
                </button>
              </div>
            </>
          )}
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
