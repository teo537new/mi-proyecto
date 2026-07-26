'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminUsuarios() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      setUsers(profiles || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Eliminar usuario "${userName}" permanentemente?`)) return
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    if (!res.ok) {
      const { error } = await res.json()
      return alert('Error al eliminar: ' + error)
    }
    await supabase.from('profiles').delete().eq('id', userId)
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  if (loading) return <p style={{ color: '#999' }}>Cargando usuarios...</p>

  return (
    <>
      <h1 style={{ marginBottom: '30px' }}>
        <i className="fas fa-users" style={{ color: '#00a8cc', marginRight: '10px' }}></i>
        Usuarios ({users.length})
      </h1>

      {users.length === 0 ? (
        <p style={{ color: '#999' }}>No hay usuarios registrados aún.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: '14px', padding: '25px', border: '1px solid #e8e8e8', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', color: '#999', fontWeight: '600' }}>Nombre</th>
                <th style={{ padding: '10px 12px', color: '#999', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '10px 12px', color: '#999', fontWeight: '600' }}>Rol</th>
                <th style={{ padding: '10px 12px', color: '#999', fontWeight: '600' }}>Registro</th>
                <th style={{ padding: '10px 12px', width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {users.filter((u) => u.role !== 'admin').map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{u.name || '—'}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{u.email || '—'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: '#e8f5e9', color: '#28a745',
                      padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                    }}>Cliente</span>
                  </td>
                  <td style={{ padding: '12px', color: '#999', fontSize: '13px' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('es-AR') : '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      style={{
                        background: 'none', border: 'none', color: '#dc3545',
                        cursor: 'pointer', fontSize: '16px', padding: '4px',
                      }}
                      title="Eliminar usuario"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
