import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://afqmzvwzdiqqseaxxyps.supabase.co',
  'sb_publishable_sA101Ow0WUJTgyRjL3OzAQ_WMw9wimw'
)

// Check what the current user sees in profiles
// Try to select from products with different filters
const tests = [
  supabase.from('products').select('id, name, active').limit(3),
  supabase.from('profiles').select('*'),
]

const [prod, prof] = await Promise.all(tests)

console.log('=== Products (any) ===')
console.log(JSON.stringify(prod, null, 2))

console.log('\n=== Profiles ===')
console.log(JSON.stringify(prof, null, 2))
