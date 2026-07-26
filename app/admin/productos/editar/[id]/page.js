'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PRODUCT_TYPES, getProductType } from '@/lib/product-types'
import SpecFields from '@/components/spec-fields'

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function EditarProducto() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState([])
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_price: '',
    stock_type: 'stock',
    stock_quantity: '0',
    category: '',
    product_type: 'other',
    specs: '',
    specsArray: [],
    featured: false,
    active: true,
  })

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (data) {
        const pt = data.product_type || 'other'
        const td = getProductType(pt)
        const specsArray = td.specs.map((s) => {
          const existing = (data.specs || []).find((x) => (x.key || x.name) === (s.key || s.label))
          return { key: s.key, name: s.label, value: existing?.value || '' }
        })
        setForm({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          compare_price: data.compare_price?.toString() || '',
          stock_type: data.stock_type || 'stock',
          stock_quantity: data.stock_quantity?.toString() || '0',
          category: data.category || '',
          product_type: pt,
          specs: (data.specs || []).map((s) => `${s.name || s.label}: ${s.value}`).join('\n'),
          specsArray,
          featured: data.featured || false,
          active: data.active ?? true,
        })
        setImageUrls(data.images || [])
      }
      setFetching(false)
    }
    load()
  }, [params.id])

  const update = (field) => (e) => {
    const value = e.target.value
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'name') {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const handleUpload = async (e) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    const urls = []

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) urls.push(data.url)
    }

    setImageUrls((prev) => [...prev, ...urls])
    setUploading(false)
  }

  const removeImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const typeDef = getProductType(form.product_type)
    const specs = typeDef.specs.length > 0
      ? form.specsArray.filter((s) => s.value)
      : form.specs
          ? form.specs.split('\n').filter(Boolean).map((line) => {
              const [name, value] = line.split(':').map((s) => s.trim())
              return { name, value }
            })
          : []

    const { error } = await supabase
      .from('products')
      .update({
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        stock_type: form.stock_type,
        stock_quantity: parseInt(form.stock_quantity),
        category: form.category || null,
        product_type: form.product_type,
        specs,
        images: imageUrls,
        featured: form.featured,
        active: form.active,
      })
      .eq('id', params.id)

    if (error) {
      alert('Error: ' + error.message)
      setLoading(false)
      return
    }

    router.push('/admin/productos')
  }

  const toggle = (field) => () => setForm((prev) => ({ ...prev, [field]: !prev[field] }))

  if (fetching) return <p>Cargando producto...</p>

  return (
    <>
      <h1 style={{ marginBottom: '30px' }}>Editar Producto</h1>

      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '14px', padding: '40px', border: '1px solid #e8e8e8', maxWidth: '700px' }}>
        <div className="form-group">
          <label>Nombre del producto</label>
          <input className="form-control" value={form.name} onChange={update('name')} required />
        </div>

        <div className="form-group">
          <label>Slug (URL)</label>
          <input className="form-control" value={form.slug} onChange={update('slug')} required />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea className="form-control" rows="4" value={form.description} onChange={update('description')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Precio ($)</label>
            <input className="form-control" type="number" step="0.01" value={form.price} onChange={update('price')} required />
          </div>
          <div className="form-group">
            <label>Precio anterior (tachado)</label>
            <input className="form-control" type="number" step="0.01" value={form.compare_price} onChange={update('compare_price')} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Tipo de stock</label>
            <select className="form-control" value={form.stock_type} onChange={update('stock_type')}>
              <option value="stock">En Stock</option>
              <option value="order">A Pedido</option>
            </select>
          </div>
          <div className="form-group">
            <label>Cantidad en stock</label>
            <input className="form-control" type="number" value={form.stock_quantity} onChange={update('stock_quantity')} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Tipo de producto</label>
            <select className="form-control" value={form.product_type} onChange={(e) => {
              const val = e.target.value
              const td = getProductType(val)
              const initial = td.specs.map((s) => ({ key: s.key, name: s.label, value: '' }))
              setForm((prev) => ({ ...prev, product_type: val, specsArray: initial }))
            }}>
              {PRODUCT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <input className="form-control" placeholder="Ej: Componentes, Periféricos" value={form.category} onChange={update('category')} />
          </div>
        </div>

        {form.product_type === 'other' ? (
          <div className="form-group">
            <label>Especificaciones (una por línea: nombre: valor)</label>
            <textarea className="form-control" rows="4" placeholder="Ejemplo:&#10;Procesador: Intel i7&#10;RAM: 16GB" value={form.specs} onChange={update('specs')} />
          </div>
        ) : (
          <SpecFields productType={form.product_type} specs={form.specsArray} onChange={(arr) => setForm((prev) => ({ ...prev, specsArray: arr }))} />
        )}

        <div className="form-group">
          <label>Imágenes del producto</label>
          <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading}
            style={{ width: '100%', padding: '12px', border: '2px dashed #e0e0e0', borderRadius: '10px', cursor: 'pointer', background: '#fafafa' }}
          />
          {uploading && <p style={{ color: '#00a8cc', fontSize: '13px', marginTop: '8px' }}>Subiendo imágenes...</p>}
          {imageUrls.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              {imageUrls.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  <button type="button" onClick={() => removeImage(i)}
                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: '#dc3545', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.featured} onChange={toggle('featured')} />
            Destacado
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.active} onChange={toggle('active')} />
            Activo
          </label>
        </div>

        <button type="submit" className="modal-btn" disabled={loading || uploading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </>
  )
}
