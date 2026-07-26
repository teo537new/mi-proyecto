import { createClient } from './server'

export async function getProducts({ search, type, page = 1, limit = 10 } = {}) {
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (type && type !== 'all') {
    query = query.eq('stock_type', type)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, count } = await query
  return { products: data || [], total: count || 0 }
}

export async function getProductBySlug(slug) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()
  return data
}

export async function getRelatedProducts(product) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .neq('id', product.id)
    .eq('category', product.category)
    .limit(10)
  if (data?.length) return data
  const { data: fallback } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .neq('id', product.id)
    .limit(10)
  return fallback || []
}

export async function getFeaturedProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .eq('featured', true)
    .limit(10)
  return data || []
}

export async function getOrders(userId) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getAdminOrders() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*), profiles(name)')
    .order('created_at', { ascending: false })
  return data || []
}

export async function getAdminProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}
