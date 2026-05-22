import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('[Supabase] VITE_SUPABASE_URL is missing. Set it in .env')
}

if (!supabaseAnonKey) {
  console.error('[Supabase] VITE_SUPABASE_ANON_KEY is missing. Set it in .env')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
