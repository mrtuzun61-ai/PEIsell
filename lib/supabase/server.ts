import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const FALLBACK_URL = 'https://uwtedswyfheibqgkxlvm.supabase.co'
const FALLBACK_KEY = 'sb_publishable_O3h_QXV17c8U9INUsuP_NA_A4K1cUqN'

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Components cannot always write cookies.
        }
      },
    },
  })
}
