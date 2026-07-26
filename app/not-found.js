import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 40px' }}>
      <i className="fas fa-search" style={{ fontSize: '80px', color: '#e0e0e0', marginBottom: '30px' }}></i>
      <h1 style={{ fontSize: '48px', color: '#1a1a2e', marginBottom: '10px' }}>404</h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
        Página no encontrada
      </p>
      <Link
        href="/"
        style={{
          padding: '14px 30px',
          background: 'linear-gradient(135deg, #00a8cc, #0077b6)',
          color: '#fff',
          borderRadius: '10px',
          fontWeight: '700',
          textDecoration: 'none',
        }}
      >
        Volver al inicio
      </Link>
    </div>
  )
}
