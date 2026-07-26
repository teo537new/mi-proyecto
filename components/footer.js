import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src="/pcafondo4.png" alt="PCAFondo.com" />
          <p>Tu tienda de tecnología con los mejores precios del mercado. Stock propio, envíos rápidos y pedidos especiales al mejor precio. Solo envíos, sin complicaciones.</p>
          <div className="footer-social">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
            <a href="#"><i className="fab fa-whatsapp"></i></a>
          </div>
        </div>
        <div className="footer-column">
          <h4>Medios de Pago</h4>
          <ul>
            <li><a href="#"><i className="fas fa-credit-card"></i> Visa</a></li>
            <li><a href="#"><i className="fas fa-credit-card"></i> Mastercard</a></li>
            <li><a href="#"><i className="fas fa-money-bill-wave"></i> Efectivo</a></li>
            <li><a href="#"><i className="fas fa-mobile-alt"></i> MercadoPago</a></li>
            <li><a href="#"><i className="fas fa-university"></i> Transferencia</a></li>
            <li><a href="#"><i className="fas fa-qrcode"></i> QR</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Servicios</h4>
          <ul>
            <li><a href="#"><i className="fas fa-truck-fast"></i> Envíos</a></li>
            <li><a href="#"><i className="fas fa-box-open"></i> Pedidos Especiales</a></li>
            <li><a href="#"><i className="fas fa-shield-halved"></i> Garantía</a></li>
            <li><a href="#"><i className="fas fa-headset"></i> Soporte</a></li>
            <li><a href="#"><i className="fas fa-rotate-left"></i> Devoluciones</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Contacto</h4>
          <ul>
            <li><a href="#"><i className="fas fa-envelope"></i> info@pcafondo.com</a></li>
            <li><a href="#"><i className="fas fa-phone"></i> +54 11 1234-5678</a></li>
            <li><a href="#"><i className="fas fa-map-marker-alt"></i> Buenos Aires, Argentina</a></li>
            <li><a href="#"><i className="fas fa-clock"></i> Lun-Vie: 9-18hs</a></li>
            <li><a href="#"><i className="fab fa-whatsapp"></i> WhatsApp Directo</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 PCAFondo.com &mdash; Todos los derechos reservados. | <Link href="#">Términos y Condiciones</Link> | <Link href="#">Política de Privacidad</Link> | <Link href="#">Cookies</Link></p>
      </div>
    </footer>
  )
}
