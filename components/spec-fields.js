'use client'

import { getProductType } from '@/lib/product-types'

export default function SpecFields({ productType, specs, onChange }) {
  const typeDef = getProductType(productType)
  if (!typeDef.specs.length) return null

  const specMap = {}
  for (const s of specs) {
    specMap[s.key || s.name] = s.value
  }

  const update = (key) => (e) => {
    const val = e.target.value
    const newSpecs = typeDef.specs.map((spec) => ({
      key: spec.key,
      name: spec.label,
      value: specMap[spec.key] || '',
    }))
    const entry = newSpecs.find((s) => s.key === key)
    if (entry) entry.value = val
    onChange(newSpecs)
  }

  return (
    <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: '20px', marginTop: '5px' }}>
      <p style={{ fontWeight: '600', color: '#1a1a2e', marginBottom: '15px', fontSize: '14px' }}>
        <i className="fas fa-microchip" style={{ color: '#00a8cc', marginRight: '8px' }}></i>
        Especificaciones {typeDef.label}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {typeDef.specs.map((spec) => (
          <div key={spec.key} className="form-group" style={{ marginBottom: '0' }}>
            <label>{spec.label}</label>
            <input
              className="form-control"
              placeholder={spec.placeholder}
              value={specMap[spec.key] || ''}
              onChange={update(spec.key)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
