import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts } from '@/lib/supabase/queries'
import ProductDetailClient from './product-detail-client'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Producto no encontrado' }
  return {
    title: `${product.name} - PCAFondo.com`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images?.[0],
    },
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const relatedProducts = await getRelatedProducts(product)

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />
}
