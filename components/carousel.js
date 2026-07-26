export default function Carousel() {
  const items = [
    { icon: 'fa-truck-fast', title: 'Envío Rápido', desc: 'Entrega en 24-48hs a todo el país' },
    { icon: 'fa-tags', title: 'Mejor Precio Garantizado', desc: 'Stock propio = precios imbatible' },
    { icon: 'fa-box-open', title: 'A Pedido -10% Extra', desc: 'Traemos lo que necesites, 10 días' },
    { icon: 'fa-shield-halved', title: 'Garantía Real', desc: 'Todos los productos con garantía oficial' },
    { icon: 'fa-headset', title: 'Soporte Técnico', desc: 'Asesoramiento personalizado gratis' },
    { icon: 'fa-credit-card', title: 'Pago Seguro', desc: 'Múltiples métodos de pago protegidos' },
  ]

  return (
    <section className="carousel-section">
      <div className="carousel-container">
        {[...items, ...items].map((item, i) => (
          <div className="carousel-item" key={i}>
            <div className="carousel-icon"><i className={`fas ${item.icon}`}></i></div>
            <div className="carousel-text">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
