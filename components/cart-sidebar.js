'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/context/cart-context'
import { useAuth } from '@/lib/context/auth-context'

export default function CartSidebar() {
  const { items, count, total, updateQty, removeItem } = useCart()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen((prev) => !prev)
    window.addEventListener('toggleCart', handler)
    return () => window.removeEventListener('toggleCart', handler)
  }, [])

  const close = () => setOpen(false)

  return (
    <>
      <div className={`cart-overlay ${open ? 'active' : ''}`} onClick={close}></div>
      <div className={`cart-sidebar ${open ? 'active' : ''}`}>
        <div className="cart-header">
          <h3><i className="fas fa-shopping-cart" style={{ color: '#ff6b35', marginRight: '10px' }}></i>Tu Carrito</h3>
          <button className="cart-close" onClick={close}>×</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <i className="fas fa-shopping-basket"></i>
              <p>Tu carrito está vacío</p>
              <p style={{ fontSize: '13px', marginTop: '10px' }}>¡Agrega productos y aprovecha los mejores precios!</p>
            </div>
          ) : (
            items.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-img">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className="fas fa-box"></i>
                  )}
                </div>
                  <div className="cart-item-info">
                    <div className="cart-item-header">
                      <div className="cart-item-name">{item.name}</div>
                      <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <div className="cart-item-price">${item.price.toLocaleString('es-AR')}</div>
                    <div className="cart-item-qty">
                      <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>-</button>
                      <span>{item.qty}</span>
                      <button className="qty-btn" onClick={() => {
                        if (item.stock_type === 'stock' && item.qty >= item.stock_quantity) {
                          window.dispatchEvent(new CustomEvent('showToast', {
                            detail: `Solo hay ${item.stock_quantity} unidades disponibles`,
                          }))
                          return
                        }
                        updateQty(item.id, 1)
                      }}>+</button>
                    </div>
                  </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span>${total.toLocaleString('es-AR')}</span>
          </div>
          {user ? (
            <Link href="/checkout" onClick={close}>
              <button className="cart-checkout">
                <i className="fas fa-credit-card"></i> Finalizar Compra
              </button>
            </Link>
          ) : (
            <button className="cart-checkout" onClick={() => {
              close()
              const event = new CustomEvent('openLogin')
              window.dispatchEvent(event)
            }}>
              <i className="fas fa-sign-in-alt"></i> Inicia Sesión para Comprar
            </button>
          )}
        </div>
      </div>
    </>
  )
}
