import { AuthProvider } from '@/lib/context/auth-context'
import { CartProvider } from '@/lib/context/cart-context'
import Header from '@/components/header'
import Footer from '@/components/footer'
import CartSidebar from '@/components/cart-sidebar'
import Toast from '@/components/toast'
import './globals.css'

export const metadata = {
  title: 'PCAFondo.com - Electrónica y PC al Mejor Precio',
  description: 'Tu tienda de tecnología con los mejores precios del mercado. Stock propio, envíos rápidos y pedidos especiales.',
  openGraph: {
    title: 'PCAFondo.com',
    description: 'Electrónica y PC al Mejor Precio',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <CartSidebar />
            <Toast />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
