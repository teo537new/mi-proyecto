'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isValidCuit } from '@/lib/qr-code'

export default function AdminConfig() {
  const supabase = createClient()
  const [form, setForm] = useState({
    cbu_alias: '',
    cbu_number: '',
    cuit: '',
    store_name: '',
    store_city: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('store_settings').select('*').single()
      if (data)
        setForm({
          cbu_alias: data.cbu_alias || '',
          cbu_number: data.cbu_number || '',
          cuit: data.cuit || '',
          store_name: data.store_name || 'PC AFONDO',
          store_city: data.store_city || '',
        })
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    if (form.cuit && !isValidCuit(form.cuit)) {
      alert('CUIT inválido. Verificá que sean 11 dígitos válidos.')
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('store_settings')
      .update({
        cbu_alias: form.cbu_alias.trim(),
        cbu_number: form.cbu_number.trim(),
        cuit: form.cuit.trim(),
        store_name: form.store_name.trim(),
        store_city: form.store_city.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setSaved(true)
    }
    setSaving(false)
  }

  if (loading) return <p>Cargando...</p>

  return (
    <>
      <h1 style={{ marginBottom: '30px' }}>Configuración de Pago</h1>

      <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: '14px', padding: '40px', border: '1px solid #e8e8e8', maxWidth: '500px' }}>
        <div className="form-group">
          <label>Alias CBU</label>
          <input className="form-control" value={form.cbu_alias} onChange={(e) => setForm({ ...form, cbu_alias: e.target.value })} required />
          <small style={{ color: '#999', fontSize: '12px' }}>Ej: pca.fondo.mp</small>
        </div>

        <div className="form-group">
          <label>Número CBU</label>
          <input className="form-control" value={form.cbu_number} onChange={(e) => setForm({ ...form, cbu_number: e.target.value })} required />
          <small style={{ color: '#999', fontSize: '12px' }}>22 dígitos</small>
        </div>

        <div className="form-group">
          <label>CUIT / CUIL del titular de la cuenta</label>
          <input className="form-control" value={form.cuit} onChange={(e) => setForm({ ...form, cuit: e.target.value })} placeholder="20-12345678-9" />
          <small style={{ color: '#999', fontSize: '12px' }}>
            Obligatorio para el QR de pago (norma BCRA, posición 50). Va sin guiones.
          </small>
        </div>

        <div className="form-group">
          <label>Nombre del comercio (opcional)</label>
          <input className="form-control" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} />
          <small style={{ color: '#999', fontSize: '12px' }}>Viene en el QR. Por defecto: PC AFONDO</small>
        </div>

        <div className="form-group">
          <label>Ciudad (opcional)</label>
          <input className="form-control" value={form.store_city} onChange={(e) => setForm({ ...form, store_city: e.target.value })} />
          <small style={{ color: '#999', fontSize: '12px' }}>Ej: CABA</small>
        </div>

        <button type="submit" className="modal-btn" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </button>

        {saved && (
          <p style={{ color: '#00a650', marginTop: '15px', fontWeight: '600' }}>
            <i className="fas fa-check-circle"></i> Datos guardados
          </p>
        )}
      </form>
    </>
  )
}