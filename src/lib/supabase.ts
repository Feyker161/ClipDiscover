import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getServerClient(): SupabaseClient {
  const key = serviceRole || anonKey
  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

function getBrowserClient() {
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  })
}

export { getServerClient, getBrowserClient }
