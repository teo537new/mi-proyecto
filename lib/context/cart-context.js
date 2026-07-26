'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './auth-context'

const CartContext = createContext({
  items: [],
  count: 0,
  total: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
})

function getKey(user) {
  return user?.id ? `cart_${user.id}` : 'cart_guest'
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const storageKey = getKey(user)
  const [items, setItems] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try { setItems(JSON.parse(saved)) } catch {}
      return
    }
    // Migrar carrito de invitado al loguearse
    if (user) {
      const guestCart = localStorage.getItem('cart_guest')
      if (guestCart) {
        try {
          const parsed = JSON.parse(guestCart)
          if (parsed.length > 0) {
            setItems(parsed)
            localStorage.removeItem('cart_guest')
            return
          }
        } catch {}
      }
    }
    setItems([])
  }, [storageKey])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(storageKey, JSON.stringify(items))
    }
  }, [items, mounted, storageKey])

  const count = items.reduce((acc, i) => acc + i.qty, 0)
  const total = items.reduce((acc, i) => acc + i.price * i.qty, 0)

  const addItem = (product) => {
    const qtyToAdd = product.qty || 1
    setItems((prev) => {
      const exist = prev.find((i) => i.id === product.id)
      const currentQty = exist?.qty || 0
      if (product.stock_type === 'stock' && currentQty + qtyToAdd > product.stock_quantity) {
        return prev
      }
      if (exist) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qtyToAdd } : i
        )
      }
      return [...prev, { ...product, qty: qtyToAdd }]
    })
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id !== id) return i
          const newQty = i.qty + delta
          if (delta > 0 && i.stock_type === 'stock' && newQty > i.stock_quantity) return i
          return { ...i, qty: newQty }
        })
        .filter((i) => i.qty > 0)
    )
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider
      value={{ items, count, total, addItem, removeItem, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
