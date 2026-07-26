import Carousel from '@/components/carousel'
import Benefits from '@/components/benefits'
import ProductCard from '@/components/product-card'
import { getProducts } from '@/lib/supabase/queries'

export default async function Home({ searchParams }) {
  const params = await searchParams
  const { products } = await getProducts({
    search: params.search,
    type: params.type || 'all',
    limit: 20,
  })

  return (
    <>
      <Carousel />

      <section className="products-section">
        <div className="products-header">
          <div className="stock-tabs">
            <form method="GET" action="/" style={{ display: 'flex', gap: '15px' }}>
              <button
                className={`stock-tab ${(!params.type || params.type === 'all') ? 'active' : ''}`}
                name="type"
                value="all"
              >
                Todos
              </button>
              <button
                className={`stock-tab ${params.type === 'stock' ? 'active' : ''}`}
                name="type"
                value="stock"
              >
                En Stock
              </button>
              <button
                className={`stock-tab ${params.type === 'order' ? 'active' : ''}`}
                name="type"
                value="order"
              >
                A Pedido
              </button>
            </form>
          </div>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
            <i className="fas fa-search" style={{ fontSize: '60px', marginBottom: '20px', color: '#e0e0e0' }}></i>
            <p style={{ fontSize: '18px' }}>No se encontraron productos</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Benefits />
    </>
  )
}
