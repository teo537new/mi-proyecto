import { createClient } from '@/lib/supabase/server'

export default async function sitemap() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('active', true)

  const productUrls =
    products?.map((product) => ({
      url: `https://pcafondo.com/producto/${product.slug}`,
      lastModified: product.updated_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    })) || []

  return [
    {
      url: 'https://pcafondo.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...productUrls,
  ]
}
