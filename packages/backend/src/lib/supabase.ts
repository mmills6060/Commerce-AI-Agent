import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase.js'

let supabaseInstance: SupabaseClient<Database> | null = null

function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL
  if (!url) {
    throw new Error(
      'SUPABASE_URL is not set. Please check your .env file.\n' +
      'Expected format: SUPABASE_URL=https://xxxxx.supabase.co'
    )
  }
  if (url.includes('your_supabase_url_here')) {
    throw new Error(
      'SUPABASE_URL contains placeholder value. Please update your .env file with actual Supabase URL.\n' +
      'Get it from: https://app.supabase.com → Your Project → Settings → API'
    )
  }
  return url
}

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Please check your .env file.\n' +
      'Expected format: SUPABASE_SERVICE_ROLE_KEY=eyJhbG...'
    )
  }
  if (key.includes('your_supabase_service_role_key_here')) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY contains placeholder value. Please update your .env file.\n' +
      'Get it from: https://app.supabase.com → Your Project → Settings → API → service_role key'
    )
  }
  return key
}

function initializeSupabase(): SupabaseClient<Database> {
  const supabaseUrl = getSupabaseUrl()
  const supabaseServiceKey = getServiceRoleKey()

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Lazy initialization - only create client when first accessed
function getSupabaseInstance(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    try {
      supabaseInstance = initializeSupabase()
    } catch (error) {
      if (error instanceof Error) {
        // eslint-disable-next-line no-console
        console.error('\n❌ Supabase Configuration Error:\n')
        // eslint-disable-next-line no-console
        console.error(error.message)
        // eslint-disable-next-line no-console
        console.error('\n📖 See QUICK_START.md for setup instructions.\n')
      }
      throw error
    }
  }
  return supabaseInstance
}

// Export supabase as a Proxy that preserves types
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const instance = getSupabaseInstance()
    return (instance as unknown as Record<string | symbol, unknown>)[prop]
  }
}) as SupabaseClient<Database>

// Client for user-specific operations (uses anon key)
export function createSupabaseClient() {
  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
  
  if (!supabaseAnonKey) {
    throw new Error(
      'SUPABASE_ANON_KEY is not set. Please check your .env file.\n' +
      'Expected format: SUPABASE_ANON_KEY=eyJhbG...'
    )
  }
  
  if (supabaseAnonKey.includes('your_supabase_anon_key_here')) {
    throw new Error(
      'SUPABASE_ANON_KEY contains placeholder value. Please update your .env file.\n' +
      'Get it from: https://app.supabase.com → Your Project → Settings → API → anon public key'
    )
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

