'use client'

import Link from 'next/link'

export default function ProductCard({ product }) {
  const badgeClass = product.stock_type === 'stock'
    ? (product.compare_price ? 'badge-sale' : 'badge-stock')
    : 'badge-order'

  const badgeText = product.stock_type === 'stock'
    ? (product.compare_price ? 'Oferta' : 'En Stock')
    : 'A Pedido'

  return (
    <Link href={`/producto/${product.slug}`}>
      <div className="product-card">
        <div className="product-image">
          <span className={`product-badge ${badgeClass}`}>{badgeText}</span>
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <i className="fas fa-box"></i>
          )}
        </div>
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          <div className="product-price">
            ${Number(product.price).toLocaleString('es-AR')}
            {product.compare_price && (
              <span>${Number(product.compare_price).toLocaleString('es-AR')}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
