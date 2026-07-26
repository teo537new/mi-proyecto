'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/context/cart-context'

export default function ProductDetailClient({ product, relatedProducts }) {
  const router = useRouter()
  const { addItem, items } = useCart()
  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)
  const images = product.images || []
  const inCart = items.find(i => i.id === product.id)
  const maxStock = product.stock_type === 'stock' ? product.stock_quantity : Infinity
  const savings = product.compare_price
    ? Math.round(((Number(product.compare_price) - Number(product.price)) / Number(product.compare_price)) * 100)
    : 0

  const handleAdd = () => {
    const totalQty = (inCart?.qty || 0) + qty
    if (totalQty > maxStock) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: `Solo hay ${product.stock_quantity} unidades disponibles`,
      }))
      return
    }
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      slug: product.slug,
      images: product.images,
      stock_type: product.stock_type,
      stock_quantity: product.stock_quantity,
      qty,
    })
    setQty(1)
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: `¡${product.name} agregado al carrito!`,
    }))
  }

  const handleBuy = () => {
    const totalQty = (inCart?.qty || 0) + qty
    if (totalQty > maxStock) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: `Solo hay ${product.stock_quantity} unidades disponibles`,
      }))
      return
    }
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      slug: product.slug,
      images: product.images,
      stock_type: product.stock_type,
      stock_quantity: product.stock_quantity,
      qty,
    })
    setQty(1)
    router.push('/checkout')
  }

  return (
    <div className="product-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Inicio</Link>
          {product.category && (
            <>
              <span className="breadcrumb-sep">&gt;</span>
              <span className="breadcrumb-current">{product.category}</span>
            </>
          )}
          <span className="breadcrumb-sep">&gt;</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        {/* Producto Principal */}
        <div className="product-main">
          {/* Galería */}
          <div className="gallery">
            <div className="main-image">
              {images[selectedImg] ? (
                <div className="main-image-wrap">
                  <Image src={images[selectedImg]} alt={product.name} fill loading="eager" style={{ objectFit: 'contain' }} sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
              ) : (
                <i className="fas fa-box"></i>
              )}
            </div>
            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((url, i) => (
                  <button
                    key={i}
                    className={`thumbnail ${selectedImg === i ? 'active' : ''}`}
                    onClick={() => setSelectedImg(i)}
                  >
                    <img src={url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info de Compra */}
          <div className="purchase-info">
            <div className={`purchase-badge ${product.stock_type === 'stock' ? 'badge-stock' : 'badge-order'}`}>
              {product.stock_type === 'stock' ? 'En Stock' : 'A Pedido'}
            </div>

            <h1 className="product-title">{product.name}</h1>

            <div className="price-section">
              <div className="price">
                ${Number(product.price).toLocaleString('es-AR')}
                {savings > 0 && (
                  <span className="savings-badge">AHORRA {savings}%</span>
                )}
              </div>
              {product.compare_price && (
                <div className="price-original">
                  ${Number(product.compare_price).toLocaleString('es-AR')}
                </div>
              )}
            </div>

            {product.stock_type === 'stock' && (
              <>
                <div className="stock-info">
                  <span className="stock-icon">✓</span>
                  <span>Stock disponible</span>
                </div>

                <div className="shipping-info">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="2" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span>Envío a todo el país</span>
                </div>

                <div className="warranty">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00a8cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Garantía<br />180 días</span>
                </div>
              </>
            )}

            <div className="purchase-actions">
              <div className="quantity-selector">
                <button className="qty-btn-sm" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
                <span>{qty}</span>
                <button className="qty-btn-sm" onClick={() => {
                  const remaining = maxStock - (inCart?.qty || 0)
                  if (qty >= remaining) {
                    window.dispatchEvent(new CustomEvent('showToast', {
                      detail: `Solo hay ${product.stock_quantity} unidades disponibles`,
                    }))
                    return
                  }
                  setQty((q) => Math.min(remaining, q + 1))
                }}>+</button>
              </div>

              <button className="btn-add-cart" onClick={handleAdd}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Agregar al Carrito
              </button>

              <button className="btn-buy" onClick={handleBuy}>
                COMPRAR
              </button>
            </div>
          </div>
        </div>

        {/* Descripción y Características */}
        <div className="product-details">
          <div className="description-section">
            <h2 className="section-title">Descripción</h2>
            {product.description ? (
              <p className="description-text">{product.description}</p>
            ) : (
              <p className="no-content">Sin descripción disponible</p>
            )}
          </div>

          <div className="features-section">
            <h2 className="section-title">Características principales</h2>
            {product.specs?.length > 0 ? (
              <ul className="features-list">
                {product.specs.map((spec, i) => (
                  <li key={i}>
                    <span className="feature-dot"></span>
                    {spec.name || spec.label}: {spec.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-content">Sin especificaciones disponibles</p>
            )}
          </div>
        </div>

        {/* Productos Relacionados */}
        {relatedProducts?.length > 0 && (
          <div className="related-products">
            <h2 className="related-title">Otros productos que te pueden interesar</h2>
            <div className="related-grid">
              {relatedProducts.map((rp) => (
                <Link href={`/producto/${rp.slug}`} key={rp.id} className="related-card">
                  <div className="related-card-image">
                    {rp.images?.[0] ? (
                      <img src={rp.images[0]} alt={rp.name} />
                    ) : (
                      <i className="fas fa-box"></i>
                    )}
                  </div>
                  <div className="related-card-title">{rp.name}</div>
                  <div className="related-card-price">
                    ${Number(rp.price).toLocaleString('es-AR')}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
