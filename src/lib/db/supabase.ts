import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  // Support both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL for compatibility
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time (especially on Vercel), env vars might not be available
  // Create a placeholder client that will fail gracefully at runtime
  if (!supabaseUrl || !supabaseAnonKey) {
    // Use placeholder values for build - will fail at runtime if not set
    supabaseClient = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    )
    return supabaseClient
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

// Lazy initialization: client is created only when first accessed
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    const value = client[prop as keyof SupabaseClient]
    
    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client)
    }
    
    return value
  },
})

