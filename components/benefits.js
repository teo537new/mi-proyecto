export default function Benefits() {
  const items = [
    { icon: 'fa-piggy-bank', title: 'Mejor Precio', desc: 'Stock propio sin intermediarios. Precios competitivos en componentes, PC y gadgets electrónicos.' },
    { icon: 'fa-bolt', title: 'Envío Express', desc: 'Envíos a todo el país en 24-48 horas. Solo envíos, sin tienda física = más rápido.' },
    { icon: 'fa-hand-holding-dollar', title: 'Pedido Especial', desc: '¿No lo tenemos? Lo traemos. Mejores precios en pedidos a importación. Llega en 10 días.' },
    { icon: 'fa-truck', title: 'Envío Gratis', desc: 'En compras superiores a $50.000. Empaques reforzados para proteger tu electrónica.' },
  ]

  return (
    <section className="benefits-section">
      <h2 className="section-title">¿Por Qué Elegir PCafondo?</h2>
      <p className="section-subtitle">La mejor opción para tu setup tecnológico</p>
      <div className="benefits-grid">
        {items.map((item, i) => (
          <div className="benefit-card" key={i}>
            <div className="benefit-icon"><i className={`fas ${item.icon}`}></i></div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
