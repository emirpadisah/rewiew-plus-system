import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getRequiredServerEnv } from '@/lib/env'

let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = getRequiredServerEnv('SUPABASE_URL')
  const supabaseServiceRoleKey = getRequiredServerEnv('SUPABASE_SERVICE_ROLE_KEY')

  supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
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

