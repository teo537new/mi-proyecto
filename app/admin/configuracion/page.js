'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminConfig() {
  const supabase = createClient()
  const [form, setForm] = useState({ cbu_alias: '', cbu_number: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('store_settings').select('*').single()
      if (data) setForm({ cbu_alias: data.cbu_alias || '', cbu_number: data.cbu_number || '' })
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    const { error } = await supabase
      .from('store_settings')
      .update({ cbu_alias: form.cbu_alias, cbu_number: form.cbu_number, updated_at: new Date().toISOString() })
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
