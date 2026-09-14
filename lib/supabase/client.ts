import { createBrowserClient } from '@supabase/ssr'

const FALLBACK_URL = 'https://uwtedswyfheibqgkxlvm.supabase.co'
const FALLBACK_KEY = 'sb_publishable_O3h_QXV17c8U9INUsuP_NA_A4K1cUqN'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY

  return createBrowserClient(url, key)
}
