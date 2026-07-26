'use client'

import { useState, useEffect } from 'react'

export default function Toast() {
  const [message, setMessage] = useState('')
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      setMessage(e.detail)
      setShow(true)
      setTimeout(() => setShow(false), 3000)
    }
    window.addEventListener('showToast', handler)
    return () => window.removeEventListener('showToast', handler)
  }, [])

  if (!show) return null

  return (
    <div className={`toast ${show ? 'show' : ''}`}>
      <i className="fas fa-check-circle"></i>
      <span>{message}</span>
    </div>
  )
}
